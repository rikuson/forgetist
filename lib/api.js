const bent = require('bent')
const hash = require('./hash');

const api = {
  API_URL: 'https://api.todoist.com/rest/v1/tasks',
  API_HEADER: { 'Authorization': 'Bearer ' + process.env.TODOIST_API_TOKEN },
};

api.create = function(task) {
  const request = bent(this.API_URL, 'POST', 'json', 200);
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
    console.log('\x1b[90m', this.API_URL, JSON.stringify(this.API_HEADER), JSON.stringify(body, null, 2), '\u001b[0m');
    return false;
  }
  return request('', body, this.API_HEADER);
}

api.read = function() {
  const request = bent(this.API_URL, 'GET', 'json', 200);
  const today = new Date();
  return new Promise((resolve, reject) => {
    request('', null, this.API_HEADER).then(response => {
      const tasks = response;
      const overDueTasks = tasks
        .filter(task => {
          if (!task.due) return false;
          const dueDate = new Date(task.due.date);
          return dueDate < today;
        })
        .map(task => Object.assign(task, {
          hash: hash(task.id),
          due_date: task.due.date,
          due_recurring: task.due.recurring,
        }));
      if (global.debug) {
        console.log('Read tasks');
        console.log('\x1b[90m' + this.API_URL, JSON.stringify(this.API_HEADER), JSON.stringify(overDueTasks, null, 2), '\u001b[0m');
      }
      resolve(overDueTasks);
    }).catch(error => {
      reject(error);
    });
  });
}

api.update = function(task) {
  const request = bent(this.API_URL, 'POST', 'json', 204);
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
    console.log('\x1b[90m' + this.API_URL, JSON.stringify(this.API_HEADER), JSON.stringify(task, null, 2), '\u001b[0m');
    return false;
  }
  return request('/' + task.id, { content, due_date, due_lang }, this.API_HEADER);
}

api.delete = function(task) {
  const request = bent(this.API_URL, 'DELETE', null, 204);
  if (global.debug) {
    console.log('Delete task');
    console.log('\x1b[90m' + this.API_URL, JSON.stringify(this.API_HEADER), JSON.stringify(task, null, 2), '\u001b[0m');
    return false;
  }
  return request('/' + task.id, null, this.API_HEADER);
}

module.exports = api;
