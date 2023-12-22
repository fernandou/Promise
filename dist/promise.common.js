'use strict';

function noop() { }
let promiseID = 1;
// 1调用resolve或者reject的时候遍历当前promise的then数组
// 2调用then方法的时候判断当前promise的状态来决定立即执行或者保存到数组中
// 3链式调用的时候如果第一个promise状态时pedding，那就报道第一个promise中 

//three state
const STATE_PEDDING = 'pedding';
const STATE_RESOLVE = 'resolve';
const STATE_REJECT = 'reject';
function Promise$1(callback, prevPromise = null) {
  this.state = STATE_PEDDING;
  this.queue = {};
  this.queueId = 1;
  this.result = null;
  this.prevPromise = prevPromise;
  this.id = promiseID++;
  callback(resolve.bind(this), reject.bind(this));
}

Promise$1.prototype.then = function () {
  if (arguments.length === 0) {
    return this
  }
  const twoFun = {};

  if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      twoFun.resolve = arguments[0];
    } else {
      twoFun.resolve = () => {
        return arguments[0]
      };
    }
    if (this.prevPromise) {
      const prevPromise = this.prevPromise;
      prevPromise.queue[prevPromise.queueId].push(twoFun);
      return prevPromise
    } else {
      if (this.state === STATE_PEDDING) {
        this.queueId++;
        this.queue[this.queueId] = [twoFun];
        return new Promise$1(noop, this)
      } else {
        if (this.state === STATE_RESOLVE) {
          return Promise$1.resolve(twoFun.resolve.call(this, this.result))
        } else if (this.state === STATE_REJECT) {
          return this
        }
      }
    }
  } else if (arguments.length === 2) {
    if (typeof arguments[0] === 'function') {
      twoFun.resolve = arguments[0];
    } else {
      twoFun.resolve = () => {
        return arguments[0]
      };
    }
    if (typeof arguments[1] === 'function') {
      twoFun.reject = arguments[0];
    } else {
      twoFun.reject = () => {
        return arguments[1]
      };
    }
    if (this.prevPromise) {
      const prevPromise = this.prevPromise;
      prevPromise.queue[prevPromise.queueId].push(twoFun);
      return prevPromise
    } else {
      if (this.state === STATE_PEDDING) {
        this.queueId++;
        this.queue[this.queueId] = [twoFun];
        return new Promise$1(noop, this)
      } else {
        if (this.state === STATE_RESOLVE) {
          return Promise$1.resolve(twoFun.resolve.call(this, this.result))
        } else if (this.state === STATE_REJECT) {
          return Promise$1.resolve(twoFun.reject.call(this, this.result))
        }
      }
    }
  }
};

Promise$1.prototype.catch = function (callback) {
  return this.then(undefined, callback)
};

function batch(promise) {
  const queue = promise.queue;

  Object.keys(queue).forEach((_key) => {
    const queue_child = queue[_key];
    let doFnArray = [];
    queue_child.forEach((twoFun, index) => {
      if (twoFun.reject) {
        if (index === 0) {
          doFnArray[index] = function () {
            return promise.then(twoFun.resolve, twoFun.reject)
          };
        } else {
          doFnArray[index] = function () {
            return doFnArray[index - 1]().then(twoFun.resolve, twoFun.reject)
          };
        }
      } else {
        if (index === 0) {
          doFnArray[index] = function () {
            return promise.then(twoFun.resolve)
          };
        } else {
          doFnArray[index] = function () {
            return doFnArray[index - 1]().then(twoFun.resolve)
          };
        }
      }
    });
    doFnArray[queue_child.length - 1]();
  });
}
Promise$1.resolve = function (promise, reason) {
  if (isPromise(promise)) {
    return promise
  }
  return promiseFactory('resolve', promise, reason)
};

Promise$1.reject = function (promise, error) {
  if (isPromise(promise)) {
    return promise
  }
  return promiseFactory('reject', promise, error)
};

function promiseFactory(type, promise, result) {
  if (type === 'resolve') {
    return new Promise$1((resolve, reject) => {
      resolve(result);
    })
  } else if (type === 'reject') {
    return new Promise$1((resolve, reject) => {
      reject(result);
    })
  }
}

function resolve(reason) {
  this.state = STATE_RESOLVE;
  this.result = reason;
  batch(this);
}

function reject(error) {
  this.state = STATE_REJECT;
  this.result = error;
  batch(this);
}

function isPromise(obj) {
  if (!obj) {
    return false
  }
  return obj instanceof Promise$1
}

module.exports = Promise$1;
