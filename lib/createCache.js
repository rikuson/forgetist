const db = require('./db');

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

module.exports = createCache;
