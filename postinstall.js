const os = require('os');
const fs = require('fs');
const path = require('path');
const { trash } = require('./lib');

fs.copyFileSync(
  path.resolve(os.tmpdir(), 'forgetist.sqlite3'),
  path.resolve(__dirname, 'trash.sqlite3'),
);

trash.migrate();
