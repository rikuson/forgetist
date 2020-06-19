#!/usr/bin/env node
"use strict";

// TODO: Enable using without network
// TODO: Chache api data to make it fast
// TODO: Add columns is_deleted, is_lost
const log4js = require('log4js');
const path = require('path');
const {
  db,
  hash,
  deleteTask,
  getActiveTasks,
  createTask,
  updateTask,
  getCache,
  getActiveCache,
  getLastId,
  updateCache,
} = require('./lib');

const que = []; // TODO: Use setInterval
const LANG = Intl.NumberFormat().resolvedOptions().locale.slice(0, 2);
const today = new Date();
const logger = log4js.getLogger();

// TODO: unknown command
// TODO: invalid options
require('yargs')
  .command(
    'forget [hash...]', 
    'Delete overdue task', 
    (yargs) => {
      yargs.positional('hash', { describe: 'task hash' });
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
    'remember [hash...]',
    'Reschedule overdue tasks',
    (yargs) => {
      yargs.positional('hash', { describe: 'task hash' });
    },
    remember,
  )
  .option('all', {
    alias: 'a',
    type: 'boolean',
    description: 'All of the overdue task',
  })
  .option('until', {
    alias: 'u',
    type: 'string',
    description: 'Due date',
  })
  /* TODO
  .option('ctime', {
    type: 'number',
    description: 'Filter by created time'
  })
  .option('dtime', {
    type: 'number',
    description: 'Filter by deleted time'
  })
  .option('otime', {
    type: 'number',
    description: 'Filter by over time'
  })
  */
  .option('log', {
    type: 'string',
    description: 'Path to log directory',
  })
  .option('lang', {
    type: 'string',
    description: 'Specify language to parse date string',
  })
  .argv;

async function forget(argv) {
  try {
    init(argv);
    const cache = await getActiveCache();
    const targets = argv.all ? cache : argv.hash.map(hash => {
      const reg = new RegExp(hash + '.+');
      const matched = cache.filter(task => argv.all || String(task.hash).match(reg));
      if (matched.length !== 1) throw new Error(`ambiguous argument: '${hash}'`);
      return matched[0];
    });
    targets.forEach(task => {
      deleteTask(task);
      console.info('Delete', task.hash);
      logger.info('Deleted', task);
    });
  } catch (e) {
    console.error(e);
    logger.error(e);
  }
}

async function list(argv) {
  try {
    init(argv);
    const targets = await (argv.all ? getCache : getActiveCache)();
    // TODO: think about api interval limit
    targets.forEach(task => {
      console.log('\u001b[93m' + task.hash, (task.deleted ? '\u001b[91m(Deleted)' : '') + '\u001b[0m');
      console.log('DUE DATE:', task.due_date);
      console.log('CREATED: ', task.created);
      if (task.deleted) {
        console.log('DELETED: ', task.deleted);
      }
      console.log("\n", task.content, "\n");
    });
  } catch (e) {
    console.error(e);
    logger.error(e);
  }
}

async function remember(argv) {
  try {
    init(argv);
    const targets = (await getCache()).sort((a, b) => a.id > b.id);
    if (!argv.all) {
      targets = argv.id.map(id => {
        const reg = new RegExp(id + '.+');
        const matched = targets.filter(task => argv.all || String(task.id).match(reg));
        if (matched.length !== 1) throw new Error(`ambiguous argument: '${id}'`);
        return matched[0];
      });
    }
    targets.forEach(task => {
      task.due_date = argv.until;
      task.due_lang = argv.lang || LANG;
      console.info('Remember', task.id);
      if (task.deleted) {
        createTask(task);
      } else {
        updateTask(task);
      }
      logger.info('Remembered', task);
    });
  } catch(e) {
    console.error(e);
    logger.error(e);
  }
}

async function init(argv) {
  db.serialize(() => {
    db.run(`create table if not exists cache (
      id integer primary key,
      hash text,
      project_id integer,
      section_id integer,
      content text,
      label_ids text,
      parent integer,
      priority integer,
      assignee integer,
      due_date datetime,
      due_string text,
      due_recurring integer,
      created datetime,
      deleted datetime,
      synced datetime
    )`);
  });

  if (argv.log) setUpLogger(argv.log);

  const lastId = await getLastId();
  const tasks = await getActiveTasks();
  tasks.filter(t => t.id > lastId).forEach(t => updateCache(t));
}

function setUpLogger(dir) {
  const y = today.getFullYear();
  const m = ('0' + (1 + today.getMonth())).slice(-2);
  const d = ('0' + today.getDate()).slice(-2);
  const filename =  path.resolve(__dirname, dir, [y, m, d].join('-') + '.log');
  log4js.configure({
    appenders: {
      system: { type: 'file', filename }
    },
    categories: {
      default: { appenders: ['system'], level: 'info' },
    },
  });
}
