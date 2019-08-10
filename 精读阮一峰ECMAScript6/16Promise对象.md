# Promise对象

## 1.Promise 的含义
Promise 是异步编程的一种解决方案

Promise对象有以下两个特点：
- 对象的状态不受外界影响
- 一旦状态改变，就不会再变

Promise缺点
- 无法中途取消Promise。
- Promise内部抛出的错误，不会反应到外部
- 当处于pending状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

与setTimeout区别
1. setTimeout(fn, 0)在下一轮“事件循环”开始时执行
2. Promise.resolve()在本轮“事件循环”结束时执行

## 2.基本用法
```javascript
const getJSON = function(url) {
  const promise = new Promise(function(resolve, reject){
    const handler = function() {
      if (this.readyState !== 4) {
        return;
      }
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error(this.statusText));
      }
    };
    const client = new XMLHttpRequest();
    client.open("GET", url);
    client.onreadystatechange = handler;
    client.responseType = "json";
    client.setRequestHeader("Accept", "application/json");
    client.send();
  });

  return promise;
};

getJSON("/posts.json").then(function(json) {
  console.log('Contents: ' + json);
}, function(error) {
  console.error('出错了', error);
});
```

1. resolved 的 Promise 是在本轮事件循环的末尾执行
2. resolve或reject以后代码依旧执行，直到return

```javascript
new Promise((resolve, reject) => {
  resolve(1);
  console.log(2);
  return 1
  console.log(3)
}).then(r => {
  console.log(r);
});
// 2
// 1
```

## 3.Promise.prototype.then()
## 4.Promise.prototype.catch()
捕获错误
```javascript
p.then((val) => console.log('fulfilled:', val))
  .catch((err) => console.log('rejected', err));

// 等同于
p.then((val) => console.log('fulfilled:', val))
  .then(null, (err) => console.log("rejected:", err));
```

## 5.Promise.prototype.finally()
finally方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。

## 6.Promise.all()
Promise.all方法用于将多个 Promise 实例，包装成一个新的 Promise 实例
```javascript
const p = Promise.all([p1, p2, p3]);
```
p的状态由p1、p2、p3决定，分成两种情况。
1. 只有p1、p2、p3的状态都变成fulfilled，p的状态才会变成fulfilled，此时p1、p2、p3的返回值组成一个数组，传递给p的回调函数。
2. 只要p1、p2、p3之中有一个被rejected，p的状态就变成rejected，此时第一个被reject的实例的返回值，会传递给p的回调函数。

## 7.Promise.race()
Promise.race方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例
```javascript
const p = Promise.race([p1, p2, p3]);
```
上面代码中，只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给p的回调函数。

## 8.Promise.resolve()
返回一个新的 Promise 实例，该实例的状态为rejected。
```javascript
Promise.resolve('foo')
// 等价于
new Promise(resolve => resolve('foo'))
```
Promise.resolve方法的参数分成四种情况。
1. 参数是一个 Promise 实例：不做任何修改、原封不动地返回这个实例。
2. 参数是一个thenable对象：将这个对象转为 Promise 对象，然后就立即执行thenable对象的then方法。
3. 参数不是具有then方法的对象，或根本就不是对象：返回一个新的 Promise 对象，状态为resolved
4. 不带有任何参数

```javascript
// 2. 参数是一个thenable对象：将这个对象转为 Promise 对象，然后就立即执行thenable对象的then方法。
let thenable = {
  then: function(resolve, reject) {
    resolve(42);
  }
};

let p1 = Promise.resolve(thenable);
p1.then(function(value) {
  console.log(value);  // 42
});
```

## 9.Promise.reject()
返回一个新的 Promise 实例，该实例的状态为rejected。

```javascript
const p = Promise.reject('出错了');
// 等同于
const p = new Promise((resolve, reject) => reject('出错了'))
```

与Promise.resolve不同：Promise.reject()方法的参数，会原封不动地作为reject的理由，变成后续方法的参数
```javascript
const thenable = {
  then(resolve, reject) {
    reject('出错了');
  }
};

Promise.reject(thenable)
.catch(e => {
  console.log(e === thenable)
})
// true
```

## 10.应用
### 10.1 加载图片
```javascript
const preloadImage = function (path) {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    image.onload  = resolve;
    image.onerror = reject;
    image.src = path;
  });
};
```
### 10.2 Generator 函数与 Promise 的结合
```javascript
function getFoo () {
  return new Promise(function (resolve, reject){
    resolve('foo');
  });
}

const g = function* () {
  try {
    const foo = yield getFoo();
    console.log(foo);
  } catch (e) {
    console.log(e);
  }
};

function run (generator) {
  const it = generator();

  function go(result) {
    if (result.done) return result.value;

    return result.value.then(function (value) {
      return go(it.next(value));
    }, function (error) {
      return go(it.throw(error));
    });
  }

  go(it.next());
}

run(g);
```

## 11.Promise.try()
用Promise处理同步和异步函数
1. 同步和异步错误统一处理
```javascript
Promise.try(() => database.users.get({id: userId}))
  .then(...)
  .catch(...)
```

## 模拟遍历器
```javascript
var it = makeIterator(['a', 'b']);

it.next() // { value: "a" }
it.next() // { value: "b"}
it.next() // { done: true }

function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function() {
      return nextIndex < array.length ?
        {value: array[nextIndex++]} :
        {done: true};
    }
  };
}
```
