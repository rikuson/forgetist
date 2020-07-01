const bent = require('bent')


const API_URL = 'https://api.todoist.com/rest/v1/tasks';
const API_INTERVAL_MS = '1200';
const API_HEADER = { 'Authorization': 'Bearer ' + process.env.TODOIST_API_TOKEN };

const c = bent(API_URL, 'POST', 'json', 200);
const r = bent(API_URL, 'GET', 'json', 200);
const u = bent(API_URL, 'POST', 'json', 204);
const d = bent(API_URL, 'DELETE', null, 204);

function createTask(task) {
  const body = {
    content: '',
    project_id: null,
    section_id: null,
    parent_id: null,
    parent: null,
    order: null,
    label_ids: null,
    priority: null,
    due_string: null,
    due_date: null,
    due_datetime: null,
    due_lang: null,
    assignee: null,
  };
  for (let key in body) {
    const value = task[key];
    if (value !== undefined && value !== null) {
      body[key] = value;
    } else {
      delete body[key];
    }
  }
  if (global.debug) { 
    console.log('Create task');
    console.log('\x1b[90m', API_URL, JSON.stringify(API_HEADER), JSON.stringify(body, null, 2), '\u001b[0m');
    return false;
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
        console.log('Read tasks');
        console.log('\x1b[90m' + API_URL, JSON.stringify(API_HEADER), JSON.stringify(overDueTasks, null, 2), '\u001b[0m');
      }
      resolve(overDueTasks);
    }).catch(error => {
      reject(error);
    });
  });
}

function updateTask(task) {
  const body = {
    content: null,
    label_ids: null,
    priority: null,
    due_string: null,
    due_date: null,
    due_datetime: null,
    due_lang: null,
    assignee: null,
  };
  for (let key in body) {
    const value = task[key];
    if (value !== undefined && value !== null) {
      body[key] = value;
    } else {
      delete body[key];
    }
  }
  const { content, due_date, due_lang } = task;
  if (global.debug) {
    console.log('Update task');
    console.log('\x1b[90m' + API_URL, JSON.stringify(API_HEADER), JSON.stringify(task, null, 2), '\u001b[0m');
    return false;
  }
  return u('/' + task.id, { content, due_date, due_lang }, API_HEADER);
}

function deleteTask(task) {
  if (global.debug) {
    console.log('Delete task');
    console.log('\x1b[90m' + API_URL, JSON.stringify(API_HEADER), JSON.stringify(task, null, 2), '\u001b[0m');
    return false;
  }
  return d('/' + task.id, null, API_HEADER);
}

const api = {
  API_URL,
  API_HEADER,
  create: createTask,
  read: readTasks,
  update: updateTask,
  delete: deleteTask,
};

module.exports = api;
