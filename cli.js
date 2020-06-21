#!/usr/bin/env node
"use strict";

// TODO: Enable using without network
// TODO: Chache api data to make it fast
// TODO: Add columns is_deleted, is_lost
// TODO: Debug mode without request
const { api, cache, createLogger } = require('./lib');

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
  .argv;

async function forget(argv) {
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
      console.info('Delete', task.hash);
      task.deleted = today.toDateString();
      cache.update(task);
      // api.delete(task);
      logger.info('Deleted', task);
    });
  } catch (e) {
    console.error(e);
    logger.error(e);
  }
}

async function list(argv) {
  const logger = createLogger(argv.dir);
  try {
    await sync(argv);
    const targets = await (argv.all ? cache.read() : cache.read('where deleted is null'));
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
  const logger = createLogger(argv.dir);
  try {
    await sync(argv);
    const targets = await cache.read();
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
  const lastTask = await cache.read('order by id desc limit 1');
  const lastId = lastTask || 0;
  const tasks = await api.read();
  tasks.filter(t => t.id > lastId).forEach(t => cache.update(t));
}
