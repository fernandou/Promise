var assert = require('assert');
const Promise =  require('../index')
const p1= new Promise((resolve,reject)=>{
  resolve('p1 resolve')
})
const p2= new Promise((resolve,reject)=>{
  reject('p2 reject')
})

const p3= new Promise((resolve,reject)=>{
  resolve('p3 resolve')
})

describe('simple', function() {
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

describe('multi', function() {
  describe('2 then', function() {
    it('should p1 p2 return', function() {
      p1.then((res)=>{
        assert.equal(res,'p1 resolve')
        return p2
      }).then((res)=>{

      },(err)=>{
        assert.equal(err,'p2 reject')
      })
    });
  });
});