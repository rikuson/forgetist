#!/usr/bin/env node
"use strict";

const { api, trash, hash, createLogger, render } = require('./lib');

trash.create();

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
    list,
  )
  .command(
    'remember',
    'List overdue tasks',
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
  .option('debug', {
    type: 'boolean',
    description: 'Debug mode',
  })
  .strict()
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
      trash.add(task);
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
    const targets = await trash.read('ORDER BY id DESC');
    targets.forEach(task => {
      render.remember(task);
    });
  } catch(e) {
    console.error(e);
    logger.error(e);
  }
}
