#!/usr/bin/env node

const request = require('request')
const log4js = require('log4js')
const logger = log4js.getLogger();

const API_URL = 'https://api.todoist.com/rest/v1/tasks';

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
    (argv) => {
      argv.all ? forgetAll() : forget(argv.id);
    })
  .option('all', {
    alias: 'a',
    type: 'boolean',
    description: 'Delete all of the overdue task'
  })
  .command(
    'list',
    'List overdue tasks',
    (yargs) => {},
    (argv) => {
      argv.all ? listDetail() : list();
    }
  )
  .argv

function list() {
  request({ url: API_URL, method: 'GET' }, (e, response, body) => {
    try {
      if (e) throw e;
      const tasks = JSON.parse(body);
      const overDueTasks = tasks.filter(task => {
        if (!task.due) return false;

        const dueDate = new Date(task.due.date);
        return dueDate < today;
      });
      console.table(overDueTasks.map(task => ({
        'ID': task.id,
        'CONTENT': task.content,
        'CREATED_AT': task.created,
        'DUE_DATE': task.due.date,
      })));
    } catch (e) {
      logger.error(body);
    }
  }).auth(null, null, true, process.env.TODOIST_API_TOKEN);
}

function listDetail() {
}

function forget(ids) {
  request({ url: API_URL, method: 'GET' }, (e, response, body) => {
    try {
      if (e) throw e;
      const tasks = JSON.parse(body);
      tasks.filter(task => ids.includes(task.id)).forEach(task => {
        if (!task.due) throw new Error('due date is not set'); // TODO: specify id

        const dueDate = new Date(task.due.date);
        if (dueDate >= today) throw new Error('task is not overdue'); // TODO: specify id

        request({ url: API_URL + '/' + task.id, method: 'DELETE' }, (e, response, body) => {
          if (e) throw e;
          console.info('task is forgotten');
          logger.info(task);
        }).auth(null, null, true, process.env.TODOIST_API_TOKEN);
      })
    } catch (e) {
      logger.error(body);
    }
  }).auth(null, null, true, process.env.TODOIST_API_TOKEN);;
}

function forgetAll() {
  request({ url: API_URL, method: 'GET' }, (e, response, body) => {
    try {
      if (e) throw e;
      const tasks = JSON.parse(body);
      tasks.forEach(task => {
        if (!task.due) return false;

        const dueDate = new Date(task.due.date);
        if (dueDate >= today) return false;

        request({ url: API_URL + '/' + task.id, method: 'DELETE' }, (e, response, body) => {
          if (e) throw e;
          logger.info(task);
        }).auth(null, null, true, process.env.TODOIST_API_TOKEN);
      });
    } catch (e) {
      logger.error(body);
    }
  }).auth(null, null, true, process.env.TODOIST_API_TOKEN);
}
