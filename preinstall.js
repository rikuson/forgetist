const os = require('os');
const fs = require('fs');
const path = require('path');

fs.copyFileSync(
  path.resolve(__dirname, 'trash.sqlite3'),
  path.resolve(os.tmpdir(), 'forgetist.sqlite3'),
);
