const db = require('./db');

function getActiveCache() {
  return new Promise((resolve, reject) => {
    db.all(`select * from cache where deleted is null`, (error, rows) => {
      if (error) {
        reject(error);
      }
      resolve(rows);
    });
  });
}

module.exports = getActiveCache;
