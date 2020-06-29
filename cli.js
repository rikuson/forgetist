#!/usr/bin/env node
"use strict";

// TODO: Enable using without network
// TODO: Add columns is_deleted, is_lost
const { api, cache, createLogger, render } = require('./lib');

const que = []; // TODO: Use setInterval
const LANG = Intl.NumberFormat().resolvedOptions().locale.slice(0, 2);

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
  .option('debug', {
    type: 'boolean',
    description: 'Debug mode.',
  })
  .argv;

async function forget(argv) {
  global.debug = argv.debug;
  const logger = createLogger(argv.dir);
  const today = new Date();
  try {
    await sync(argv);
    const tasks = await cache.read('where deleted is null');
    const targets = argv.all ? tasks : argv.hash.map(hash => {
      const reg = new RegExp(hash + '.+');
      const matched = tasks.filter(task => argv.all || String(task.hash).match(reg));
      if (matched.length !== 1) throw new Error(`ambiguous argument: '${hash}'`);
      return matched[0];
    });
    targets.forEach(task => {
      render.forget(task);
      task.deleted = today.toISOString();
      cache.update(task);
      api.delete(task);
      logger.info('Deleted', task);
    });
  } catch (e) {
    console.error(e);
    logger.error(e);
  }
}

async function list(argv) {
  global.debug = argv.debug;
  const logger = createLogger(argv.dir);
  try {
    await sync(argv);
    const targets = await (argv.all ? cache.read('ORDER BY id DESC') : cache.read('WHERE DELETED IS NULL ORDER BY id DESC'));
    // TODO: think about api interval limit
    targets.forEach(render.list);
  } catch (e) {
    console.error(e);
    logger.error(e);
  }
}

async function remember(argv) {
  global.debug = argv.debug;
  const logger = createLogger(argv.dir);
  try {
    await sync(argv);
    let targets = await cache.read();
    if (!argv.all) {
      targets = argv.hash.map(hash => {
        const reg = new RegExp(hash + '.+');
        const matched = targets.filter(task => argv.all || String(task.hash).match(reg));
        if (matched.length !== 1) throw new Error(`ambiguous argument: '${hash}'`);
        return matched[0];
      });
    }
    targets.forEach(task => {
      task.due_date = argv.until || '';
      task.due_lang = argv.lang || LANG;
      task.due_string = '';
      render.remember(task);
      if (task.deleted) {
        api.create(task);
      } else {
        api.update(task);
      }
      logger.info('Remembered', task);
    });
  } catch(e) {
    console.error(e);
    logger.error(e);
  }
}

async function sync(argv) {
  cache.create();
  const lastTask = await cache.read('ORDER BY id DESC LIMIT 1');
  const lastId = lastTask.length ? lastTask[0].id : 0;
  const tasks = await api.read();
  const today = new Date();
  tasks
    .filter(t => t.id > lastId)
    .forEach(t => cache.update(Object.assign(t, { synced: today.toISOString() })));
}
