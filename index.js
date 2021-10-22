(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global.Promise = factory());
}(this, function () {
  'use strict';

  //three status
  const STATUS_PEDDING = 'pedding'
  const STATUS_RESOLVE = 'resolve'
  const STATUS_REJECT = 'reject'
  function Promise(callback) {
    this.status = STATUS_PEDDING
    this.queue = []
    callback(resolve.bind(this), reject.bind(this))
  }

  Promise.prototype.then = function () {
    const resolveFun = arguments[0]
    const rejectFun = arguments[1] || noop
    this.queue.push({
      resolve: resolveFun,
      reject: rejectFun
    })
    if (this.status === STATUS_PEDDING) {

    } else {
      if (waiting === false) {
        waiting = true
        nextTick(() => {
          batch(this)
          waiting = false
        })
      }
    }
    const nextPromise = new Promise((resolve, reject) => {

    })
    resolveFun.nextPromise = nextPromise
    rejectFun.nextPromise = nextPromise
    return nextPromise
  }

  function batch(promise) {
    const queue = promise.queue
    while (queue.length) {
      const twoFun = queue.shift();
      let nextPromise = twoFun[promise.status].nextPromise
      const newPromise = twoFun[promise.status](promise.status === STATUS_RESOLVE ? promise.reason : promise.error)

      if (!isPromise(newPromise)) {
        nextPromise.status = STATUS_RESOLVE
        nextPromise.reason = newPromise
      } else {
        newPromise.queue = nextPromise.queue
        nextPromise = newPromise
      }

      if (nextPromise.status !== STATUS_PEDDING) {
        nextTick(() => {
          if (nextPromise.queue.length) {
            batch(nextPromise)
          }
        })
      }
    }
  }
  Promise.resolve = function (promise, reason) {
    return promiseFactory('resolve', promise, reason)
  }

  Promise.reject = function (promise, error) {
    return promiseFactory('reject', promise, error)
  }

  function promiseFactory(type, promise, reasonOrError) {
    if (isPromise(promise)) {
      if (type === 'resolve') {
        resolve.apply(promise,reasonOrError)
      } else if (type === 'reject') {
        reject.apply(promise,reasonOrError)
      }
      return promise
    }else{
      if (type === 'resolve') {
        return new Promise((resolve, reject) => {
          resolve(reasonOrError)
        })
      } else if (type === 'reject') {
        return new Promise((resolve, reject) => {
          reject(reasonOrError)
        })
      }
    }
  }

  function resolve(reason) {
    this.status = STATUS_RESOLVE
    this.reason = reason
    batch(this)
  }

  function reject(error) {
    this.status = STATUS_REJECT
    this.error = error
    batch(this)
  }

  // thanks for Vue1.0
  let waiting = false
  function nextTick(callback) {
    if (process) {
      process.nextTick(callback)
    } else {
      setTimeout(callback, 0)
    }
  }

  function isPromise(obj) {
    if (!obj) {
      return false
    }
    return obj instanceof Promise
  }

  function noop() {

  }
  return Promise
}))

