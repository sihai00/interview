# 手写Promise.race
Promise.race方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例
```javascript
const p = Promise.race([p1, p2, p3]);
```
上面代码中，只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变

## 实现
```javascript
Promise.race = promises => new Promise((resolve, reject) => {
	promises.forEach(promise => {
		promise.then(resolve, reject)
	})
})
```

## 参考
[ECMAScript 6 入门 - 阮一峰](http://es6.ruanyifeng.com/#docs/promise#Promise-race)
