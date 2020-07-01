function list(task) {
  console.log('\u001b[93m' + task.hash, (task.deleted ? '\u001b[91m(Deleted)' : '') + '\u001b[0m');
  console.log('DUE DATE:', task.due_date);
  console.log('CREATED: ', task.created);
  if (task.deleted) {
    console.log('DELETED: ', task.deleted);
  }
  console.log("\n", task.content, "\n");
}

function forget(task) {
  console.info('Delete', '\u001b[93m' + task.hash + '\u001b[0m');
}

function remember(task) {
  console.info('Remember', '\u001b[93m' + task.id + '\u001b[0m');
}

module.exports = {
  list,
  forget,
  remember,
};
