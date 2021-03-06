const os = require('os');
const fs = require('fs');
const path = require('path');
const { trash } = require('./lib');

const tmp = path.resolve(os.tmpdir(), 'forgetist.sqlite3');
const current = path.resolve(__dirname, 'trash.sqlite3');

new Promise((resolve, reject) => {
  fs.stat(
    tmp,
    (err, stat) => err ? reject(err) : resolve(stat),
  );
}).then(stat => {
  fs.copyFileSync(tmp, current);
}).catch(() => {
  trash.init();
});

trash.migrate();
