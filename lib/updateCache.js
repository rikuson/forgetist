const db = require('./db');
const hash = require('./hash');

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
    due,
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
        created
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
        CURRENT_TIMESTAMP,
        datetime($created)
      )
    `,
    id,
    hash(id),
    project_id,
    section_id,
    content,
    label_ids.join(' '),
    parent,
    priority,
    assignee,
    due.date,
    Number(due.recurring),
    created
  );
}

module.exports = updateCache;
