--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS trash (
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
  due_recurring INTEGER,
  created DATETIME,
  deleted DATETIME
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE trash;
