const db = require('./db');

function getLastId() {
  return new Promise((resolve, reject) => {
    db.all(`select * from cache order by id desc limit 1`, (error, rows) => {
      if (error) {
        reject(error);
      }
      resolve(rows && rows.length ? rows[0].id : 0);
    });
  });
}

module.exports = getLastId;
