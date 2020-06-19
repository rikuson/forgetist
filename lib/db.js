const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('cache.sqlite3');

module.exports = db;
