const log4js = require('log4js');
const logger = log4js.getLogger();

function createLogger(dir) {
  const y = today.getFullYear();
  const m = ('0' + (1 + today.getMonth())).slice(-2);
  const d = ('0' + today.getDate()).slice(-2);
  const filename =  path.resolve(__dirname, dir, [y, m, d].join('-') + '.log');
  log4js.configure({
    appenders: {
      system: { type: 'file', filename }
    },
    categories: {
      default: { appenders: ['system'], level: 'info' },
    },
  });
  return logger;
}

module.exports = createLogger;
