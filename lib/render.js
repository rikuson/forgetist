function list(task) {
  console.log('\u001b[93m' + task.hash + '\u001b[0m');
  console.log('DUE DATE:', task.due_date);
  console.log('CREATED: ', task.created);
  console.log("\n", task.content, "\n");
}

function forget(task) {
  console.log('Delete', '\u001b[93m' + task.hash + '\u001b[0m');
}

function remember(task) {
  console.log('ID:', task.id);
  console.log('DUE DATE:', task.due_date);
  console.log('DELETED: ', task.created);
  console.log("\n", task.content, "\n");
}

module.exports = {
  list,
  forget,
  remember,
};
