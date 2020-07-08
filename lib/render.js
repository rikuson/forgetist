class UtcDate extends Date {
  constructor(dateString) {
    const local = new Date(dateString);
    super(local.getTime() - local.getTimezoneOffset() * 60000);
  }
}

function list(task) {
  const dueDate = new Date(task.due.datetime || task.due.date);
  const created = new Date(task.created);
  return `\u001b[93m${task.hash}\u001b[0m
DUE DATE: ${dueDate[task.due.datetime ? 'toLocaleString' : 'toLocaleDateString']()}
CREATED:  ${created.toLocaleString()}

${task.content}
`;
}

function forget(task) {
  return `Delete \u001b[93m${task.hash}\u001b[0m`;
}

function remember(task) {
  const dueDate = new UtcDate(task.due_date);
  const created = new UtcDate(task.created);
  const deleted = new UtcDate(task.deleted);
  return `ID:       ${task.id}
DUE DATE: ${dueDate.toLocaleString()}
CREATED:  ${created.toLocaleString()}
DELETED:  ${deleted.toLocaleString()}

${task.content}
`;
}

module.exports = {
  list,
  forget,
  remember,
};
