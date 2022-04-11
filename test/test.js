var assert = require('assert');
const Promise =  require('../index')


describe('base', function() {
  describe('resolve step1', function() {
    it('should resolve function argument', function() {
      function timeout(ms) {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, ms, 'done');
        });
      }
      timeout(100).then((value) => {
        assert.equal(value,'done')
      });
    });
  });
  describe('promise order', function() {
    it('should order like under', function() {
      let newStr = ''
      let promise = new Promise(function(resolve, reject) {
        newStr+='Promise'
        resolve();
      });
      
      promise.then(function() {
        newStr+='resolved.'
      });
      
      newStr+='Hi!'
      setTimeout(()=>{
        assert.equal(newStr,'PromiseHi!resolved.')
      })
    });
  });
  describe('resolve or reject is not the finality', function() {
    it('newStr is 2', function() {
      let newStr = ''
      new Promise((resolve, reject) => {
        resolve(1);
        newStr+=2;
      }).then(r => {
        assert.equal(newStr,2)
      });
    });
  });
});