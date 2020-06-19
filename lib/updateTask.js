const api = require('./api');

function updateTask(task) {
  const body = {};
  for (let key in task) {
    const value = String(task[key]);
    if (value) body[key] = value;
  }
  const { content, due_date, due_lang } = task;
  return api.update('/' + task.id, { content, due_date, due_lang }, api.header);
}

module.exports = updateTask;
