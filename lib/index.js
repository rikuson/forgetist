const db = require('./db');
const hash = require('./hash');
const deleteTask = require('./deleteTask');
const getActiveTasks = require('./getActiveTasks');
const createTask = require('./createTask');
const updateTask = require('./updateTask');
const getCache = require('./getCache');
const getActiveCache = require('./getActiveCache');
const getLastId = require('./getLastId');
const updateCache = require('./updateCache');

module.exports = {
  db,
  hash,
  deleteTask,
  getActiveTasks,
  createTask,
  updateTask,
  getCache,
  getActiveCache,
  getLastId,
  updateCache,
};
