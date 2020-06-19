const db = require('./db');

function getCache() {
  return new Promise((resolve, reject) => {
    db.all(`select * from cache`, (error, rows) => {
      if (error) {
        reject(error);
      }
      resolve(rows);
    });
  });
}

module.exports = getCache;
