const sqlite3 = require('sqlite3');
const hash = require('./hash');

const db = new sqlite3.Database('cache.sqlite3');

function createCache() {
  db.serialize(() => {
    db.run(`create table if not exists cache (
      id integer primary key,
      hash text,
      project_id integer,
      section_id integer,
      content text,
      label_ids text,
      parent integer,
      priority integer,
      assignee integer,
      due_date datetime,
      due_string text,
      due_recurring integer,
      created datetime,
      deleted datetime,
      synced datetime
    )`);
  });
}

function readCache(condition) {
  return new Promise((resolve, reject) => {
    db.all(`select * from cache ${condition}`, (error, rows) => {
      if (error) {
        reject(error);
      }
      resolve(rows.sort((a, b) => a.id > b.id));
    });
  });
}

function updateCache(task) {
  if (global.debug) {
    return console.log('Update cache', task);
  }
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
  db.run(
    `insert or replace into cache
      (
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
      values (
        $id,
        $hash,
        $project_id,
        $section_id,
        $content,
        $label_ids,
        $parent,
        $priority,
        $assignee,
        date($due_date),
        $due_recurring,
        datetime($synced),
        datetime($created),
        datetime($deleted)
      )
    `,
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
