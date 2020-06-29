const sqlite3 = require('sqlite3');
const hash = require('./hash');

const db = new sqlite3.Database('cache.sqlite3');

function createCache() {
  const sql = `
CREATE TABLE IF NOT EXISTS cache (
  id INTEGER PRIMARY KEY,
  hash TEXT,
  project_id INTEGER,
  section_id INTEGER,
  content TEXT,
  label_ids TEXT,
  parent INTEGER,
  priority INTEGER,
  assignee INTEGER,
  due_date DATETIME,
  due_string TEXT,
  due_recurring INTEGER,
  created DATETIME,
  deleted DATETIME,
  synced DATETIME
)`;
  if (global.debug) {
    console.log('Create cache', '\x1b[90m' + sql, '\u001b[0m');
  }
  db.serialize(() => db.run(sql));
}

function readCache(condition) {
  const sql = `SELECT * FROM cache ${condition}`;
  if (global.debug) {
    console.log('Read cache', '\n\x1b[90m' + sql, '\u001b[0m');
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

function updateCache(task) {
  const {
    id,
    project_id,
    section_id,
    content,
    label_ids,
    created,
    parent,
    priority,
    assignee,
    due_date,
    due_recurring,
    synced,
    deleted,
  } = task;
  const sql = `
INSERT OR REPLACE INTO cache (
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
  synced,
  created,
  deleted
)
VALUES (
  ${id},
  ${hash(id)},
  ${project_id},
  ${section_id},
  ${content},
  ${label_ids},
  ${parent},
  ${priority},
  ${assignee},
  ${due_date},
  ${due_recurring},
  DATETIME(${synced}),
  DATETIME(${created}),
  DATETIME(${deleted})
)`;
  if (global.debug) {
    console.log('Update cache', '\x1b[90m' + sql, '\u001b[0m');
    return false;
  }
  db.run(
    sql,
    id,
    hash(id),
    project_id,
    section_id,
    content,
    label_ids ? label_ids.join(' ') : '',
    parent,
    priority,
    assignee,
    due_date,
    due_recurring,
    synced || 'synced',
    created || 'created',
    deleted || 'deleted'
  );
}

const cache = {
  create: createCache,
  read: readCache,
  update: updateCache,
};

module.exports = cache;
