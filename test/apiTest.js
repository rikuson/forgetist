const { createApi } = require('../lib');
const { assert } = require('chai');

const api = createApi(process.env.TODOIST_API_TOKEN);

describe('api', () => {
  let id;
  describe('#create()', () => {
    it('should return new task', done => {
      const content = 'test';
      const yesterday = (() => {
        const today = new Date();
        today.setDate(today.getDate() - 1);
        return today;
      })();
      const dateStr = [
        yesterday.getFullYear(),
        ('0' + (yesterday.getMonth() + 1)).slice(-2),
        ('0' + yesterday.getDate()).slice(-2),
      ].join('-');
      api.create({ content, due_date: dateStr }).then(res => {
        assert.equal(res.content, content);
        id = res.id;
        done();
      });
    });
  });
  describe('#read()', () => {
    it('should read the task', done => {
      api.read().then(res => {
        const newTask = res.find(r => r.id === id);
        assert.typeOf(newTask, 'object');
        done();
      });
    });
  });
  describe('#delete()', () => {
    it('should delete the task', done => {
      api.delete({ id }).then(res => {
        assert.equal(res.statusCode, 204);
        done();
      });
    });
  });
});
