const os = require('os');
const fs = require('fs');
const path = require('path');
const { getInstalledPathSync } = require('get-installed-path');
const { trash } = require('./lib');

const tmp = path.resolve(os.tmpdir(), 'forgetist.sqlite3');
const current = path.resolve(getInstalledPathSync('forgetist'), 'trash.sqlite3');

new Promise((resolve, reject) => {
  fs.stat(
    path.resolve(tmp),
    (err, stat) => err ? reject(err) : resolve(stat),
  );
}).then(stat => {
  fs.copyFileSync(
    path.resolve(tmp),
    path.resolve(current),
  );
}).catch(console.info);

trash.migrate();
