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
    if(arguments.length===0){
      return this
    }
    //定义一个全新的promise用于收集then
    const nextPromise = new Promise((resolve, reject) => {

    })
    const twoFun = {}
    
    if(arguments[0] && typeof arguments[0] === 'function'){
      const resolveFun = arguments[0]
      resolveFun.nextPromise = nextPromise
      twoFun.resolve = resolveFun
    }
    if(arguments[1] && typeof arguments[1] === 'function'){
      const rejectFun = arguments[1]
      rejectFun.nextPromise = nextPromise
      twoFun.reject = rejectFun
    }
    this.queue.push(twoFun)

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

    return nextPromise
  }

  Promise.prototype.catch = function (callback) {
    return this.then(undefined,callback)
  }

  function batch(promise) {
    const queue = promise.queue
    while (queue.length) {
      const twoFun = queue.shift();
      let nextPromise
      // 如果没有resolveFun，就相当于跨过这个then
      if(promise.status===STATUS_RESOLVE && !twoFun[promise.status]){
        if(twoFun[STATUS_REJECT]){
          nextPromise = twoFun[STATUS_REJECT].nextPromise
          promise.queue.unshift({
            resolve: nextPromise.queue[0].resolve,
            reject: nextPromise.queue[0].reject
          })
          nextPromise.queue.shift()
        }
      }else if(promise.status===STATUS_REJECT && !twoFun[promise.status]){
        // 如果没有rejectFun，就相当于跨过这个then
        if(twoFun[STATUS_RESOLVE]){
          nextPromise = twoFun[STATUS_RESOLVE].nextPromise
          promise.queue.unshift({
            resolve: nextPromise.queue[0].resolve,
            reject: nextPromise.queue[0].reject
          })
          nextPromise.queue.shift()
        }
      }else{
        nextPromise = twoFun[promise.status].nextPromise
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

