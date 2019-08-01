# 手写Promise.all

Promise.all方法用于将多个 Promise 实例，包装成一个新的 Promise 实例
```javascript
const p = Promise.all([p1, p2, p3]);
```

1. 只有p1、p2、p3的状态都变成fulfilled，p的状态才会变成fulfilled，此时p1、p2、p3的返回值组成一个数组，传递给p的回调函数。
2. 只要p1、p2、p3之中有一个被rejected，p的状态就变成rejected，此时第一个被reject的实例的返回值，会传递给p的回调函数。

## 实现
```javascript
Promise.all = function (promises) {
  return new Promise((resolve, reject) => {
    promises = Array.from(promises)
    if (promises.length === 0) {
      return resolve([])
    } else {
      let result = []
      let index = 0
      for (let i = 0; i < promises.length; i++) {
        Promise.resolve(promises[i]).then(data => {
          result[i] = data
          index++
          
          if (index === promises.length) resolve(result) 
        }, err => reject(err))
      } 
    }
  })
}
```

## 参考
[ECMAScript 6 入门 - Promise 对象 - 阮一峰](http://es6.ruanyifeng.com/#docs/promise#Promise-all)
