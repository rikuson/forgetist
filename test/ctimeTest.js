const { ctime } = require('../lib');
const { assert } = require('chai');

describe('ctime', () => {
  const today = {
    content: '23 hours ago',
    created: hoursAgo(23),
  };
  const yesterday = {
    content: '25 hours ago',
    created: hoursAgo(25),
  };
  const tasks = [
    today,
    yesterday,
  ];
  describe('should return tasks earlier than n days ago', () => {
    it('~ 24 hours ago', () => {
      assert.include(tasks.filter(task => ctime(task, '+1')), yesterday);
      assert.notInclude(tasks.filter(task => ctime(task, '+1')), today);
    });
    it('~ 0 hours ago', () => {
      assert.include(tasks.filter(task => ctime(task, '+0')), yesterday);
      assert.include(tasks.filter(task => ctime(task, '+0')), today);
    });
  });
  describe('should return tasks n days ago', () => {
    it('36 hours ago ~ 24 hours ago', () => {
      assert.include(tasks.filter(task => ctime(task, 1)), yesterday);
      assert.notInclude(tasks.filter(task => ctime(task, 1)), today);
    });
    it('24 hours ago ~ 0 hours ago', () => {
      assert.notInclude(tasks.filter(task => ctime(task, 0)), yesterday);
      assert.include(tasks.filter(task => ctime(task, 0)), today);
    });
  });
  describe('should return tasks later than n days ago', () => {
    it('24 hours ago ~', () => {
      assert.notInclude(tasks.filter(task => ctime(task, '-1')), yesterday);
      assert.include(tasks.filter(task => ctime(task, '-1')), today);
    });
  });
});

function hoursAgo(hours) {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}
