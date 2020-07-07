#!/usr/bin/env node
"use strict";

// TODO: Enable using without network
// TODO: Add columns is_deleted, is_lost
const { api, cache, hash, createLogger, render } = require('./lib');

const que = []; // TODO: Use setInterval
const LANG = Intl.NumberFormat().resolvedOptions().locale.slice(0, 2);

cache.create();

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
    'List active tasks',
    (yargs) => {},
    list,
  )
  .command(
    'remember [hash...]',
    'List overdue tasks',
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
  .option('ctime', {
    type: 'number',
    description: 'Filter by created time'
  })
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
    description: 'Debug mode',
  })
  .argv;

async function forget(argv) {
  global.debug = argv.debug;
  const logger = createLogger(argv.dir);
  const today = new Date();
  try {
    const tasks = await api.read();
    tasks.forEach(task => task.hash = hash(task.id));
    const targets = argv.all ? tasks : argv.hash.map(hash => {
      const reg = new RegExp(hash + '.+');
      const matched = tasks.filter(task => argv.all || task.hash.match(reg));
      if (matched.length !== 1) throw new Error(`ambiguous argument: '${hash}'`);
      return matched[0];
    });
    targets.forEach(task => {
      render.forget(task);
      api.delete(task);
      cache.update(task);
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
    // TODO: think about api interval limit
    const targets = await api.read();
    targets.forEach(target => {
      target.hash = hash(target.id);
      render.list(target);
    });
  } catch (e) {
    console.error(e);
    logger.error(e);
  }
}

async function remember(argv) {
  global.debug = argv.debug;
  const logger = createLogger(argv.dir);
  try {
    const targets = await cache.read('ORDER BY id DESC');
    targets.forEach(task => {
      render.remember(task);
    });
  } catch(e) {
    console.error(e);
    logger.error(e);
  }
}
