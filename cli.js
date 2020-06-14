#!/usr/bin/env node

// TODO: Enable using without network
// TODO: Chache api data to make it fast
// TODO: Rename deleted_tasks.sqlite3 overdue_tasks.sqlite3
// TODO: Add columns is_deleted, is_lost
const bent = require('bent')
const sqlite3 = require('sqlite3');
const log4js = require('log4js')
const logger = log4js.getLogger();

const API_URL = 'https://api.todoist.com/rest/v1/tasks';
const api = {
  get: bent(API_URL, 'GET', 'json', 200),
  delete: bent(API_URL, 'DELETE', 'json', 204),
  create: bent(API_URL, 'POST', 'json', 200),
  update: bent(API_URL, 'POST', 'json', 204),
  header: { 'Authorization': 'Bearer ' + process.env.TODOIST_API_TOKEN },
};

const db = new sqlite3.Database('deleted_tasks.sqlite3');
db.serialize(() => {
  db.run(`create table if not exists deleted_tasks (
    id integer primary key,
    content text,
    created datetime,
    due_date datetime,
    deleted datetime
  )`);
});

const today = new Date();
const y = today.getFullYear();
const m = ('0' + (1 + today.getMonth())).slice(-2);
const d = ('0' + today.getDate()).slice(-2);
const filename =  'logs/' + [y, m, d].join('-') + '.log';
log4js.configure({
  appenders: {
    system: { type: 'file', filename }
  },
  categories: {
    default: { appenders: ['system'], level: 'info' },
  },
});

// TODO: unknown command
// TODO: invalid options
require('yargs')
  .command(
    'forget [id...]', 
    'Delete overdue task', 
    (yargs) => {
      yargs.positional('id', { describe: 'task id' });
    },
    forget,
  )
  .command(
    'list',
    'List overdue tasks',
    (yargs) => {},
    list,
  )
  .command(
    'remember [id...]',
    'Reschedule overdue tasks',
    (yargs) => {},
    remember,
  )
  .option('all', {
    alias: 'a',
    type: 'boolean',
    description: 'All of the overdue task',
  })
  .option('from', {
    type: 'string',
    description: 'From the datetime',
  })
  .option('to', {
    type: 'string',
    description: 'To the datetime',
  })
  .option('until', {
    alias: 'u',
    type: 'boolean',
    description: 'Due date',
  })
  .argv;

async function forget(argv) {
  try {
    const tasks = await getTasks();
    const targets = argv.all ? tasks : argv.id.map(id => {
      const reg = new RegExp(id + '.+');
      const matched = tasks.filter(task => argv.all || String(task.id).match(reg));
      if (matched.length !== 1) throw new Error(`ambiguous argument: '${id}'`);
      return matched[0];
    });
    targets.forEach(async task => {
      deleteTask(task);
      console.info('Deleted', task.id);
      const { id, content, created, due } = task;
      db.run(`insert or replace into deleted_tasks
        (id, content, created, due_date, deleted)
        values ($id, $content, $created, $due_date, CURRENT_TIMESTAMP)
      `, id, content, created, due.date);
      logger.info('Deleted', task);
    });
  } catch (e) {
    console.error(e);
    logger.error(e);
  }
}

async function list(argv) {
  try {
    let targets = await getTasks();
    if (argv.all) {
      const deletedTasks = await getDeletedTasks();
      targets = targets.concat(deletedTasks).sort((a, b) => a.created > b.created);
    }
    // TODO: think about api interval limit
    // Use que?
    const table = targets.map(task => ({
      // TODO: task.id.toString(16)
      // TODO: use index sort by created
      'ID': task.id,
      'CONTENT': task.content,
      'CREATED': task.created,
      'DUE DATE': task.due_date,
      'DELETED': task.deleted || '',
    }));
    console.table(table);
  } catch (e) {
    console.error(e);
    logger.error(e);
  }
}

async function remember(argv) {
  try {
    let targets = await getTasks();
    targets = targets.concat(await getDeletedTasks()).sort((a, b) => a.created > b.created);
    if (!argv.all) {
      targets = argv.id.map(id => {
        const reg = new RegExp(id + '.+');
        const matched = targets.filter(task => argv.all || String(task.id).match(reg));
        if (matched.length !== 1) throw new Error(`ambiguous argument: '${id}'`);
        return matched[0];
      });
    }
    targets.forEach(task => {
      if (task.deleted) {
        // TODO: convert db column to api
        createTask(Object.assign(task, { due_date: argv.until }));
      } else {
        updateTask(Object.assign(task, { due_date: argv.until }));
      }
    });
  } catch(e) {
    console.error(e);
    logger.error(e);
  }
}

function getTasks() {
  return new Promise((resolve, reject) => {
    api.get('', null, api.header).then(response => {
      const tasks = response;
      const overDueTasks = tasks
        .filter(task => {
          if (!task.due) return false;
          const dueDate = new Date(task.due.date);
          return dueDate < today;
        })
        .map(task => Object.assign(task, { due_date: task.due.date }));
      resolve(overDueTasks);
    }).catch(error => {
      reject(error);
    });
  });
}

function deleteTask(task) {
  return api.delete('/' + task.id, null, api.header);
}

function getDeletedTasks() {
  return new Promise((resolve, reject) => {
    db.all(`select * from deleted_tasks`, (error, rows) => {
      if (error) {
        reject(error);
      }
      resolve(rows);
    });
  });
}

function createTask(task) {
  return api.create('', task, api.header);
}

function updateTask(task) {
  return api.update('/' + task.id, task, api.header);
}
