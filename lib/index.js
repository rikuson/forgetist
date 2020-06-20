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
const createLogger = require('./createLogger');
const createCache = require('./createCache');

module.exports = {
  db,
  hash,
  createLogger,
  deleteTask,
  getActiveTasks,
  createTask,
  updateTask,
  getLastId,
  createCache,
  getCache,
  getActiveCache,
  updateCache,
};
