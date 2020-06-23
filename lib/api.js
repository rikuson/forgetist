const bent = require('bent')


const API_URL = 'https://api.todoist.com/rest/v1/tasks';
const API_INTERVAL_MS = '1200';
const API_HEADER = { 'Authorization': 'Bearer ' + process.env.TODOIST_API_TOKEN };

const c = bent(API_URL, 'POST', 'json', 200);
const r = bent(API_URL, 'GET', 'json', 200);
const u = bent(API_URL, 'POST', 'json', 204);
const d = bent(API_URL, 'DELETE', 'json', 204);

function createTask(task) {
  const body = {};
  for (let key in task) {
    const value = String(task[key]);
    if (value) body[key] = value;
  }
  if (global.debug) { 
    return console.log('Create task', body, API_HEADER);
  }
  return c('', body, API_HEADER);
}

function readTasks() {
  const today = new Date();
  return new Promise((resolve, reject) => {
    r('', null, API_HEADER).then(response => {
      const tasks = response;
      const overDueTasks = tasks
        .filter(task => {
          if (!task.due) return false;
          const dueDate = new Date(task.due.date);
          return dueDate < today;
        })
        .map(task => Object.assign(task, {
          due_date: task.due.date,
          due_recurring: task.due.recurring,
        }));
      if (global.debug) {
        console.log('Read tasks', overDueTasks);
      }
      resolve(overDueTasks);
    }).catch(error => {
      reject(error);
    });
  });
}

function updateTask(task) {
  const body = {};
  for (let key in task) {
    const value = String(task[key]);
    if (value) body[key] = value;
  }
  const { content, due_date, due_lang } = task;
  if (global.debug) {
    return console.log('Update task', task);
  }
  return u('/' + task.id, { content, due_date, due_lang }, API_HEADER);
}

function deleteTask(task) {
  if (global.debug) {
    return console.log('Delete task', task);
  }
  return d('/' + task.id, null, API_HEADER);
}

const api = {
  create: createTask,
  read: readTasks,
  update: updateTask,
  delete: deleteTask,
};

module.exports = api;
