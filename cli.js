#!/usr/bin/env node
"use strict";

const { trash, createApi, createLogger, render, ctime } = require('./lib');

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
    (yargs) => {},
    list,
  )
  .command(
    'remember',
    'List overdue tasks',
    (yargs) => {},
    remember,
  )
  .option('all', {
    alias: 'a',
    type: 'boolean',
    description: 'All of the overdue task',
  })
  .option('ctime', {
    type: 'string',
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
  .option('token', {
    type: 'string',
    description: 'Todoist api token',
  })
  .strict()
  .argv;

async function forget(argv) {
  global.debug = argv.debug;
  const logger = createLogger(argv.log);
  const api = createApi(argv.token || process.env.TODOIST_API_TOKEN);
  const today = new Date();
  try {
    const tasks = (await api.read()).filter(task => !argv.ctime || ctime(task, argv.ctime));
    const targets = argv.all ? tasks : argv.hash.map(hash => {
      const reg = new RegExp(hash + '.+');
      const matched = tasks.filter(task => argv.all || task.hash.match(reg));
      if (matched.length !== 1) throw new Error(`ambiguous argument: '${hash}'`);
      return matched[0];
    });
    targets.forEach(task => {
      console.info(render.forget(task));
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
  const logger = createLogger(argv.log);
  const api = createApi(argv.token || process.env.TODOIST_API_TOKEN);
  try {
    const targets = (await api.read()).filter(task => !argv.ctime || ctime(task, argv.ctime));
    targets.forEach(target => {
      console.info(render.list(target));
    });
  } catch (e) {
    console.error(e);
    logger.error(e);
  }
}

async function remember(argv) {
  global.debug = argv.debug;
  const logger = createLogger(argv.log);
  const api = createApi(argv.token || process.env.TODOIST_API_TOKEN);
  try {
    const targets = (await trash.read('ORDER BY id DESC')).filter(task => {
      return !argv.ctime || ctime(task, argv.ctime);
    });
    targets.forEach(task => {
      console.info(render.remember(task));
    });
  } catch(e) {
    console.error(e);
    logger.error(e);
  }
}
