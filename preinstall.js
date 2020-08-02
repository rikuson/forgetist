const os = require('os');
const fs = require('fs');
const path = require('path');
const { getInstalledPathSync } = require('get-installed-path');

const tmp = path.resolve(os.tmpdir(), 'forgetist.sqlite3');
const current = path.resolve(getInstalledPathSync('forgetist'), 'trash.sqlite3');

new Promise((resolve, reject) => {
  fs.stat(
    path.resolve(current),
    (err, stat) => err ? reject(err) : resolve(stat),
  );
}).then(stat => {
  fs.copyFileSync(
    path.resolve(current),
    path.resolve(tmp),
  );
}).catch(console.info);
