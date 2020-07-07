const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('trash.sqlite3');

function create() {
  const sql = `
CREATE TABLE IF NOT EXISTS trash (
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  section_id INTEGER,
  content TEXT,
  label_ids TEXT,
  parent INTEGER,
  priority INTEGER,
  assignee INTEGER,
  due_date DATETIME,
  due_recurring INTEGER,
  created DATETIME,
  deleted DATETIME
)`;
  if (global.debug) {
    console.log('Create trash', '\x1b[90m' + sql, '\u001b[0m');
    return false;
  }
  db.serialize(() => db.run(sql));
}

function read(condition) {
  const sql = `SELECT * FROM trash ${condition}`;
  if (global.debug) {
    console.log('Read trash', '\n\x1b[90m' + sql, '\u001b[0m');
  }
  return new Promise((resolve, reject) => {
    db.all(sql, (error, rows) => {
      if (error) {
        reject(error);
      }
      if (global.debug) {
        console.log('\x1b[90m' + JSON.stringify(rows, null, 4), '\u001b[0m');
      }
      resolve(rows);
    });
  });
}

function add(task) {
  const {
    id,
    project_id,
    section_id,
    content,
    label_ids,
    parent,
    priority,
    assignee,
    due_recurring,
    due,
    created,
  } = task;
  const sql = `
INSERT OR REPLACE INTO trash (
  id,
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
  $id,
  $project_id,
  $section_id,
  $content,
  $label_ids,
  $parent,
  $priority,
  $assignee,
  DATETIME($due_date),
  $due_recurring,
  DATETIME($created),
  CURRENT_TIMESTAMP
)`;
  if (global.debug) {
    console.log('Update trash', '\x1b[90m' + sql, '\u001b[0m');
    return false;
  }
  console.log(created);
  db.run(
    sql,
    id,
    project_id,
    section_id,
    content,
    label_ids ? label_ids.join(' ') : '',
    parent,
    priority,
    assignee,
    due.datetime || due.date,
    due_recurring,
    created,
  );
}

module.exports = {
  create,
  read,
  add,
};
