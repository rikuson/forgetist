const api = require('./api');

const today = new Date();

function getActiveTasks() {
  return new Promise((resolve, reject) => {
    api.read('', null, api.header).then(response => {
      const tasks = response;
      const overDueTasks = tasks
        .filter(task => {
          if (!task.due) return false;
          const dueDate = new Date(task.due.date);
          return dueDate < today;
        })
        .map(task => Object.assign(task, { due_date: task.due.date }));
      resolve(overDueTasks);
    }).catch(error => {
      reject(error);
    });
  });
}

module.exports = getActiveTasks;
