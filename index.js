//三种状态
const STATUS_PEDDING = 'pedding'
const STATUS_RESOLVE = 'resolve'
const STATUS_REJECT = 'reject'

function Promise(callback){
  this.status = STATUS_PEDDING
  this.resolveQueue = []
  this.rejectQueue = []
  callback(resolve.bind(this),reject.bind(this))
}

Promise.prototype.then=function(){
  const resolveFun = arguments[0]
  const rejectFun = arguments[1]||noop
  if(this.status === STATUS_PEDDING){
    this.resolveQueue.push(resolveFun)
    if(rejectFun){
      this.rejectQueue.push(rejectFun)
    }
  }else if(this.status === STATUS_RESOLVE){
    this.resolveQueue.push(resolveFun)
    if(waiting === false){
      waiting = true
      nextTick(()=>{
        batch(this.resolveQueue)
      })
    }
  }else if(this.status === STATUS_REJECT){
    this.rejectQueue.push(rejectFun)
    if(waiting === false){
      waiting = true
      nextTick(()=>{
        batch(this.rejectQueue)
      })
    }
  }
  return this
}

Promise.prototype.emit=function(type){
  if(type===STATUS_RESOLVE && this.resolveQueue.length){
    batch(this.resolveQueue)
  }else if(type===STATUS_REJECT && this.rejectQueue.length){
    batch(this.rejectQueue)
  }
}

// thanks for Vue1.0
function batch(queue){
  while(queue.length){
    const singleFun =  queue.shift();
    const queueContext = queue.context
    if(queueContext.status===STATUS_RESOLVE){
      queueContext.rejectQueue.shift()
      //切换promise 每次都返回一个新的promise
      let rs = singleFun(queueContext.reason)
      if(!isPromise(rs)){
        rs = Promise.resolve(rs)
      }
      rs.resolveQueue=queue
      rs.rejectQueue=queueContext.rejectQueue
      queueContext.resolveQueue=[]
      queueContext.rejectQueue=[]
      queue.context = rs
      if(rs.status===STATUS_PEDDING){
        break
      }
    }else if(queueContext.status===STATUS_REJECT){
      queueContext.resolveQueue.shift()
      let rs = singleFun(queueContext.error)
      if(!isPromise(rs)){
        rs = Promise.resolve(rs)
      }
      rs.resolveQueue=queueContext.resolveQueue
      rs.rejectQueue=queue
      queueContext.resolveQueue=[]
      queueContext.rejectQueue=[]
      queue.context = rs
      if(rs.status===STATUS_PEDDING){
        break
      }
    }
  }
}

Promise.resolve=function(reason){
  return simplePromise('resolve',reason)
}

Promise.reject=function(error){
  return simplePromise('reject',error)
}

function simplePromise(type,reasonOrError){
  if(isPromise(reasonOrError)){
    return reasonOrError
  }
  if(type==='resolve'){
    return new Promise((resolve,reject)=>{
      resolve(reasonOrError)
    })
  }else if(type==='reject'){
    return new Promise((resolve,reject)=>{
      reject(reasonOrError)
    })
  }
}

function resolve(reason){
  this.status = STATUS_RESOLVE
  this.reason = reason
  this.resolveQueue.context = this
  this.emit(STATUS_RESOLVE)
}

function reject(error){
  this.status = STATUS_REJECT
  this.error = error
  this.rejectQueue.context = this
  this.emit(STATUS_REJECT)
}

let waiting = false
function nextTick(callback){
  setTimeout(()=>{
    callback()
    waiting=false
  },0)
}

function isPromise(obj){
  if(!obj){
    return false
  }
  return obj instanceof Promise
}

function noop(){

}

