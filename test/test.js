var assert = require('assert');
const Promise =  require('../index')
const p1= new Promise((resolve,reject)=>{
  resolve('p1 resolve')
})
const p2= new Promise((resolve,reject)=>{
  reject('p2 reject')
})
describe('p1 resolve', function() {
  describe('resolve step1', function() {
    it('should resolve function return', function() {
      p1.then((res)=>{
        assert.equal(res,'p1 resolve')
      })
    });
  });
  describe('reject step1', function() {
    it('should reject function return', function() {
      p2.then((res)=>{
      },(rej)=>{
        assert.equal(rej,'p2 reject')
      })
    });
  });
});