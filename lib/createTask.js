const api = require('./api');

function createTask(task) {
  const body = {};
  for (let key in task) {
    const value = String(task[key]);
    if (value) body[key] = value;
  }
  return api.create('', body, api.header);
}

module.exports = createTask;
