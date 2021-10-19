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