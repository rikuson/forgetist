const bent = require('bent')

const API_URL = 'https://api.todoist.com/rest/v1/tasks';
const API_INTERVAL_MS = '1200';
const api = {
  url: API_URL,
  header: { 'Authorization': 'Bearer ' + process.env.TODOIST_API_TOKEN },
  create: bent(API_URL, 'POST', 'json', 200),
  read: bent(API_URL, 'GET', 'json', 200),
  update: bent(API_URL, 'POST', 'json', 204),
  delete: bent(API_URL, 'DELETE', 'json', 204),
};

module.exports = api;
