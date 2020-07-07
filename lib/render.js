function list(task) {
  const dueDate = new Date(task.due.datetime || task.due.date);
  const created = new Date(task.created);
  console.log('\u001b[93m' + task.hash + '\u001b[0m');
  console.log('DUE DATE:', dueDate[task.due.datetime ? 'toLocaleString' : 'toLocaleDateString']());
  console.log('CREATED: ', created.toLocaleString());
  console.log("\n", task.content, "\n");
}

function forget(task) {
  console.log('Delete', '\u001b[93m' + task.hash + '\u001b[0m');
}

function remember(task) {
  const dueDate = new UtcDate(task.due_date);
  const created = new UtcDate(task.created);
  const deleted = new UtcDate(task.deleted);
  console.log('ID:      ', task.id);
  console.log('DUE DATE:', dueDate.toLocaleString());
  console.log('CREATED: ', created.toLocaleString());
  console.log('DELETED: ', deleted.toLocaleString());
  console.log("\n", task.content, "\n");
}

class UtcDate extends Date {
  constructor(dateString) {
    const local = new Date(dateString);
    super(local.getTime() - local.getTimezoneOffset() * 60000);
  }
}

module.exports = {
  list,
  forget,
  remember,
};
