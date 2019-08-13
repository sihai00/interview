# sleep函数
延时函数：等待一段时间，再继续进行

1. Promise
2. Generator
3. async
4. es5

## Promise
```javascript
//Promise
const sleep = time => {
  return new Promise(resolve => setTimeout(resolve,time))
}
sleep(1000).then(()=>{
  console.log(1)
})
```

## Generator
```javascript
//Generator
function* sleepGenerator(time) {
  yield new Promise(function(resolve,reject){
    setTimeout(resolve,time);
  })
}
sleepGenerator(1000).next().value.then(()=>{console.log(1)})
```

## async
```javascript
//async
function sleep(time) {
  return new Promise(resolve => setTimeout(resolve,time))
}
async function output() {
  let out = await sleep(1000);
  console.log(1);
  return out;
}
output();
```

## es5
```javascript
//ES5
function sleep(callback,time) {
  if(typeof callback === 'function')
    setTimeout(callback,time)
}

function output(){
  console.log(1);
}
sleep(output,1000);
```

## 参考
[实现一个 sleep 函数](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/63)
