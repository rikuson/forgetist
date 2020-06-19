const api = require('./api');
const db = require('./db');

function deleteTask(task) {
  db.run(
    `insert or replace into cache (id, deleted) values ($id, CURRENT_TIMESTAMP)`,
    task.id
  );
  return api.delete('/' + task.id, null, api.header);
}

module.exports = deleteTask;
