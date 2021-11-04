(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global.Promise = factory());
}(this, function () {
  'use strict';

  //three state
  const STATE_PEDDING = 'pedding'
  const STATE_RESOLVE = 'resolve'
  const STATE_REJECT = 'reject'
  function Promise(callback) {
    this.state = STATE_PEDDING
    this.queue = []
    this.result = null
    callback(resolve.bind(this), reject.bind(this))
  }

  Promise.prototype.then = function () {
    if (arguments.length === 0 || (typeof arguments[0] !== 'function' && typeof arguments[1] !== 'function')) {
      return this
    }
    //define a brand new promise for collecting then
    const nextPromise = new Promise((resolve, reject) => {

    })
    const twoFun = {}

    if (arguments[0] && typeof arguments[0] === 'function') {
      const resolveFun = arguments[0]
      resolveFun.nextPromise = nextPromise
      twoFun.resolve = resolveFun
    }
    if (arguments[1] && typeof arguments[1] === 'function') {
      const rejectFun = arguments[1]
      rejectFun.nextPromise = nextPromise
      twoFun.reject = rejectFun
    }
    this.queue.push(twoFun)

    if (this.state === STATE_PEDDING) {

    } else {
      if (waiting === false) {
        waiting = true
        nextTick(() => {
          batch(this)
          waiting = false
        })
      }
    }

    return nextPromise
  }

  Promise.prototype.catch = function (callback) {
    return this.then(undefined, callback)
  }

  function batch(promise) {
    const queue = promise.queue
    while (queue.length) {
      const twoFun = queue.shift();
      let nextPromise
      // without a resolveFun，it amounts to crossing to this then
      if (promise.state === STATE_RESOLVE && !twoFun[promise.state]) {
        if (twoFun[STATE_REJECT]) {
          nextPromise = twoFun[STATE_REJECT].nextPromise
          if (nextPromise.queue.length) {
            promise.queue.unshift({
              resolve: nextPromise.queue[0].resolve,
              reject: nextPromise.queue[0].reject
            })
            nextPromise.queue.shift()
          }
        }
      } else if (promise.state === STATE_REJECT && !twoFun[promise.state]) {
        // without a rejectFun，it amounts to crossing to this then
        if (twoFun[STATE_RESOLVE]) {
          nextPromise = twoFun[STATE_RESOLVE].nextPromise
          if (nextPromise.queue.length) {
            promise.queue.unshift({
              resolve: nextPromise.queue[0].resolve,
              reject: nextPromise.queue[0].reject
            })
            nextPromise.queue.shift()
          }
        }
      } else {
        nextPromise = twoFun[promise.state].nextPromise
        const newPromise = twoFun[promise.state](promise.result)

        if (!isPromise(newPromise)) {
          nextPromise.state = STATE_RESOLVE
          nextPromise.result = newPromise
        } else {
          newPromise.queue = nextPromise.queue
          nextPromise = newPromise
        }
        if (nextPromise.state !== STATE_PEDDING) {
          //use nextTick if the prev promise queue length
          nextTick(() => {
            if (nextPromise.queue.length) {
              batch(nextPromise)
            }
          })
        }
      }
    }
  }
  Promise.resolve = function (promise, reason) {
    if (isPromise(promise)) {
      return promise
    }
    return promiseFactory('resolve', promise, reason)
  }

  Promise.reject = function (promise, error) {
    if (isPromise(promise)) {
      return promise
    }
    return promiseFactory('reject', promise, error)
  }

  function promiseFactory(type, promise, result) {
    if (type === 'resolve') {
      return new Promise((resolve, reject) => {
        resolve(result)
      })
    } else if (type === 'reject') {
      return new Promise((resolve, reject) => {
        reject(result)
      })
    }
  }

  function resolve(reason) {
    this.state = STATE_RESOLVE
    this.result = reason
    batch(this)
  }

  function reject(error) {
    this.state = STATE_REJECT
    this.result = error
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

  return Promise
}))

