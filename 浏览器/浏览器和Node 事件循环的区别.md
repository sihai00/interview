## 浏览器
浏览器的执行循环顺序：
1. 执行一次task（宏任务）
2. 执行完micro-task队列 （微任务）

![浏览器](https://user-gold-cdn.xitu.io/2019/1/10/1683863633586974?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

## Node
Node使用libuv（实现 Node.js 事件循环和平台的所有异步行为的 C 函数库）暴露的API实现事件循环机制

![Node](https://user-images.githubusercontent.com/20101525/53734427-eba9e880-3ebe-11e9-8511-eb4948e336ae.png)
- timers 阶段：本阶段执行已经安排的 setTimeout() 和 setInterval() 的回调函数。（**poll空闲时执行**）
- I/O callbacks 阶段：执行延迟到下一个循环迭代的 I/O 回调。
- idle, prepare 阶段：仅系统内部使用。
- poll 阶段：检索新的 I/O 事件;执行与 I/O 相关的回调（几乎所有情况下，除了关闭的回调函数，它们由计时器和 setImmediate() 排定的之外），其余情况 node 将在此处阻塞。
- check 阶段：setImmediate() 回调函数在这里执行。（**poll完成时执行**）
- close callbacks 阶段：一些准备关闭的回调函数，如：socket.on('close', ...)。
- **process.nextTick**：独立于 Event Loop 之外的队列。当每个阶段完成后***立即执行***

poll 轮询阶段流程：
1. 如果有timer，回到 timer 阶段执行回调
2. 如果有 I/O，执行 I/O 回调
3. 遍历回调队列并同步执行，直到队列为空或者达到系统限制
4. 如果有setImmediate，poll 阶段会停止并且进入到 check 阶段执行回调

## 区别
Node：microtask 在事件循环的各个阶段之间执行
浏览器：microtask 在事件循环的 macrotask 执行完之后执行

![区别](https://user-gold-cdn.xitu.io/2019/1/12/16841bad1cda741f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

## 特例：Node11前后版本差异
```javascript
setTimeout(()=>{
    console.log('timer1')
    Promise.resolve().then(function() {
        console.log('promise1')
    })
}, 0)
setTimeout(()=>{
    console.log('timer2')
    Promise.resolve().then(function() {
        console.log('promise2')
    })
}, 0)
```
浏览器端运行结果：timer1=>promise1=>timer2=>promise2
Node11之前的版本：timer1=>timer2=>promise1=>promise2（timers阶段会依次执行完）
Node11之后的版本：timer1=>promise1=>timer2=>promise2（执行一次宏任务后立即执行微任务）

## 题目
```javascript
async function async1(){
    console.log('async1 start')
    await async2()
    console.log('async1 end')
  }
async function async2(){
    console.log('async2')
}
console.log('script start')
setTimeout(function(){
    console.log('setTimeout0') 
},0)  
setTimeout(function(){
    console.log('setTimeout3') 
},3)  
setImmediate(() => console.log('setImmediate'));
process.nextTick(() => console.log('nextTick'));
async1();
new Promise(function(resolve){
    console.log('promise1')
    resolve();
    console.log('promise2')
}).then(function(){
    console.log('promise3')
})
console.log('script end')

// 正确结果
// script start
// async1 start
// async2
// promise1
// promise2
// script end
// nextTick
// async1 end
// promise3
// setTimeout0
// setImmediate
// setTimeout3
```
## 参考
[浏览器与Node的事件循环(Event Loop)有何区别?](https://juejin.im/post/5c337ae06fb9a049bc4cd218#heading-13)
[一道面试题引发的node事件循环深入思考](https://juejin.im/post/5cf25a19f265da1bba58ec43#heading-10)
