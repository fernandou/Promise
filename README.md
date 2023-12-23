# Promise
## Usage

~~~ javascript
const Promise = require('small-promise');
~~~

~~~ javascript
let p1 = new Promise(function(resolve,reject){
  setTimeout(()=>{
    reject({
      success:true,
      data:1
    })
  },100)
})

p1.then((res)=>{
  return 1
}).then((res)=>{
  console.log(res)
})
~~~

## problem

调用then方法的时候如果不是pedding状态，原生的Promise会放进微任务批量处理，这里的Promise是立即执行