const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

if (global.debug) {
  sqlite3.verbose();
}

let db;

async function init() {
  if (!db) {
    db = await open({
      filename: path.resolve(__dirname, '../trash.sqlite3'),
      driver: sqlite3.Database,
    });
    if (global.debug) {
      db.on('trace', data => {
        console.error(data);
        db.close();
      });
      db.on('profile', data => {
        console.info(data);
        db.close();
      });
    }
  }
  return db;
}

async function read() {
  await init();
  return await db.all('SELECT * FROM trash ORDER BY id DESC');
}

async function add(task) {
  await init();
  const {
    id,
    hash,
    project_id,
    section_id,
    content,
    label_ids,
    parent,
    priority,
    assignee,
    due_date,
    due_recurring,
    created,
  } = task;
  const sql = `
INSERT OR REPLACE INTO trash (
  id,
  hash,
  project_id,
  section_id,
  content,
  label_ids,
  parent,
  priority,
  assignee,
  due_date,
  due_recurring,
  created,
  deleted
)
VALUES (
  :id,
  :hash,
  :project_id,
  :section_id,
  :content,
  :label_ids,
  :parent,
  :priority,
  :assignee,
  DATETIME(:due_date),
  :due_recurring,
  DATETIME(:created),
  CURRENT_TIMESTAMP
)`;
  return await db.run(
    sql,
    id,
    hash,
    project_id,
    section_id,
    content,
    label_ids ? label_ids.join(' ') : '',
    parent,
    priority,
    assignee,
    due_date.toISOString(),
    due_recurring,
    created.toISOString(),
  );
}

async function migrate() {
  await init();
  return await db.migrate(arguments);
}

module.exports = {
  init,
  read,
  add,
  migrate,
};
