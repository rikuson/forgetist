const crypto = require('crypto');

function hash(id) {
  const shasum = crypto.createHash('sha1');
  shasum.update(String(id));
  const hash = shasum.digest('hex');
  return hash;
}

module.exports = hash;
