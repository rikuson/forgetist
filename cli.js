#!/usr/bin/env node

const request = require('request')
const sqlite3 = require('sqlite3');
const log4js = require('log4js')
const logger = log4js.getLogger();

const API_URL = 'https://api.todoist.com/rest/v1/tasks';

const db = new sqlite3.Database('deleted_tasks.sqlite3');

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
  .option('all', {
    alias: 'a',
    type: 'boolean',
    description: 'Delete all of the overdue task',
  })
  .command(
    'list',
    'List overdue tasks',
    (yargs) => {},
    list,
  )
  .argv

async function forget(argv) {
  try {
    db.serialize(() => {
      db.run(`create table if not exists deleted_tasks (
        id integer primary key,
        content text,
        created datetime,
        due_date datetime
      )`);
    });
    const tasks = await getTasks();
    const targets = argv.id.map(id => {
      const reg = new RegExp(id + '.+');
      const matched = tasks.filter(task => argv.all || String(task.id).match(reg));
      if (matched.length !== 1) throw new Error(`ambiguous argument: '${id}'`);
      return matched[0];
    });
    targets.forEach(async task => {
      const deletedTask = await deleteTask(task);
      console.info('Deleted', deletedTask.id);
      const { id, content, created, due } = task;
      db.run(`insert or replace into deleted_tasks
        (id, content, created, due_date)
        values ($id, $content, $created, $due_date)
      `, id, content, created, due.date);
      logger.info('Deleted', deletedTask);
    });
  } catch (e) {
    console.error(e);
    logger.error(e);
  }
}

async function list(argv) {
  try {
    const tasks = await getTasks();
    // TODO: think about api interval limit
    // Use que?
    const table = tasks.map(task => ({
      'ID': task.id,
      'CONTENT': task.content,
      'CREATED': task.created,
      'DUE DATE': task.due.date,
    }));
    console.table(table);
  } catch (e) {
    console.error(e);
    logger.error(e);
  }
}

function getTasks() {
  return new Promise((resolve, reject) => {
    request({ url: API_URL, method: 'GET' }, (error, response, body) => {
      if (error) {
        reject(error);
        return false;
      }
      const tasks = JSON.parse(body);
      const overDueTasks = tasks.filter(task => {
        if (!task.due) return false;
        const dueDate = new Date(task.due.date);
        return dueDate < today;
      });
      resolve(overDueTasks);
    }).auth(null, null, true, process.env.TODOIST_API_TOKEN);
  });
}

function deleteTask(task) {
  return new Promise((resolve, reject) => {
    request({ url: API_URL + '/' + task.id, method: 'DELETE' }, (error, response, body) => {
      if (error) {
        reject(error);
        return false;
      }
      resolve(task);
    }).auth(null, null, true, process.env.TODOIST_API_TOKEN);
  });
}
