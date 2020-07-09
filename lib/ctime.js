function ctime(task, argv) {
  const matched = argv.match(/^(\+|\-)?(\d+)$/);
  if (!matched) {
    throw new Error('illegal time value');
  }
  const created = new Date(task.created);
  const cond = new Date();
  switch (matched[1]) {
    case '-':
      cond.setDate(cond.getDate() - matched[2]);
      return created > cond;
    case '+':
      cond.setDate(cond.getDate() - matched[2] - 1);
      return created < cond;
    default:
      cond.setDate(cond.getDate() - matched[2]);
      return created >= cond && created <= cond.setDate(cond.getDate() + 1);
  }
  return created > cond;
}

module.exports = ctime;
