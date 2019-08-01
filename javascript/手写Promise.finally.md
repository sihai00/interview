## 手写Promise.finally
finally方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。它的回调函数不接受任何参数，一般用于结束状态。
```javascript
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```

## 实现
原理：不管成功或者失败都调用。
```javascript
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value  => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};
```

## 参考
[ECMAScript 6 入门 - 阮一峰](http://es6.ruanyifeng.com/#docs/promise#Promise-prototype-finally)
