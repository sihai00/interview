# Generator函数的异步应用

## 1.传统方法
ES6 诞生以前，异步编程的方法，大概有下面四种。
- 回调函数
- 事件监听
- 发布/订阅
- Promise 对象

## 2.基本概念
1. 异步：任务被人为分成两段，先执行第一段，然后转而执行其他任务，等做好了准备，再回过头执行第二段
2. 回调函数：把任务的第二段单独写在一个函数里面，等到重新执行这个任务的时候，就直接调用这个函数
3. Promise：允许将回调函数的嵌套，改成链式调用

## 3.Generator函数
### 3.1 协程
协程：多个线程互相协作，完成异步任务

流程如下：
1. 协程A开始执行。
2. 协程A执行到一半，进入暂停，执行权转移到协程B。
3. （一段时间后）协程B交还执行权。
4. 协程A恢复执行。

### 3.2 协程的 Generator 函数实现
Generator 函数是协程在 ES6 的实现，最大特点就是可以交出函数的执行权（即暂停执行）。

### 3.3 Generator 函数的数据交换和错误处理
1. next返回值的 value 属性，是 Generator 函数向外输出数据；next方法还可以接受参数，向 Generator 函数体内输入数据。
2. 指针对象的throw方法抛出的错误，可以被函数体内的try...catch代码块捕获

### 3.4 异步任务的封装
```javascript
var fetch = require('node-fetch');

function* gen(){
  var url = 'https://api.github.com/users/github';
  var result = yield fetch(url);
  console.log(result.bio);
}
var g = gen();
var result = g.next();

result.value.then(function(data){
  return data.json();
}).then(function(data){
  g.next(data);
});
```

## 4.Thunk 函数
### 4.1 参数的求值策略
- 传值调用：先求值，再传递（可能会造成性能损失）
- 传名调用：先传递，使用再求值
```javascript
// 传值调用可能会造成性能损失
function f(a, b){
  return b;
}

f(3 * x * x - 2 * x - 1, x);
// a没有使用
```

### 4.2 Thunk 函数的含义
传名调用：Thunk函数
```javascript
function f(m) {
  return m * 2;
}

f(x + 5);

// 等同于
var thunk = function () {
  return x + 5;
};

function f(thunk) {
  return thunk() * 2;
}
```

### 4.3 JavaScript 语言的 Thunk 函数
JavaScript 语言是：传值调用。它的 Thunk 函数含义有所不同，在 JavaScript 语言中，Thunk 函数将其替换成一个***只接受回调函数***作为参数的单参数函数。
```javascript
// ES5版本
var Thunk = function(fn){
  return function (){
    var args = Array.prototype.slice.call(arguments);
    return function (callback){
      args.push(callback);
      return fn.apply(this, args);
    }
  };
};

// ES6版本
var Thunk = function(fn) {
  return function (...args) {
    return function (callback) {
      return fn.call(this, ...args, callback);
    }
  };
};

function f(a, cb) {
  cb(a);
}
var ft = Thunk(f);

ft(1)(console.log) // 1
```

### 4.4 Thunkify 模块
```javascript
function thunkify(fn) {
  return function() {
    var args = new Array(arguments.length);
    var ctx = this;

    for (var i = 0; i < args.length; ++i) {
      args[i] = arguments[i];
    }

    return function (done) {
      var called;

      args.push(function () {
        if (called) return;
        called = true;
        done.apply(null, arguments);
      });

      try {
        fn.apply(ctx, args);
      } catch (err) {
        done(err);
      }
    }
  }
};

function f(a, b, callback){
  var sum = a + b;
  callback(sum);
  callback(sum);
}

var ft = thunkify(f);
var print = console.log.bind(console);
ft(1, 2)(print);
// 3
```
### 4.5 Generator 函数的流程管理
Thunk 函数现在可以用于 Generator 函数的自动流程管理
```javascript
var Thunk = function(fn) {
  return function (...args) {
    return function (callback) {
      return fn.call(this, ...args, callback);
    }
  };
};

function f(a, cb) {
  setTimeout(() => {
	  cb(a)
  }, 1000)
}
var ft = Thunk(f)

var gen = function* () {
  var f1 = yield ft(1);
  console.log('f1');
  var f2 = yield ft(2);
  console.log('f2');
};
var g = gen()
var r1 = g.next()
r1.value(function(){
	var r2 = g.next()
	r2.value(function(){
		var r3 = g.next()
		console.log(r3)
	})
})
```

### 4.6 Thunk 函数的自动流程管理
```javascript
var Thunk = function(fn) {
  return function (...args) {
    return function (callback) {
      return fn.call(this, ...args, callback);
    }
  };
};

function f(a, cb) {
  setTimeout(() => {
	cb(a)
  }, 1000)
}
var ft = Thunk(f)

var gen = function* () {
  var f1 = yield ft(1);
  console.log('f1');
  var f2 = yield ft(2);
  console.log('f2');
};

function run(fn){
	var gen = fn()

	function next(){
		var result = gen.next()
		if(result.done) return
		result.value(next)
	}
	next()
}
run(gen)
```

## 5.co 模块
co 模块可以让你不用编写 Generator 函数的执行器
```javascript
var co = require('co');
var gen = function* () {
  var f1 = yield readFile('/etc/fstab');
  var f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
co(gen).then(function (){
  console.log('Generator 函数执行完成');
});
```

### 5.1 co 模块的原理
Generator 就是一个异步操作的容器。它的自动执行需要一种机制，当异步操作有了结果，能够自动交回执行权。
- 回调函数：将异步操作包装成 Thunk 函数，在回调函数里面交回执行权。
- Promise对象：将异步操作包装成 Promise 对象，用then方法交回执行权。

### 5.2 基于 Promise 对象的自动执行
```javascript
var readFile = function (fileName){
  return new Promise(function (resolve, reject){
    setTimeout(() => {
      resolve(fileName);
    }, 1000)
  });
};
var gen = function* (){
  var f1 = yield readFile('/etc/fstab');
  console.log(f1);
  var f2 = yield readFile('/etc/shells');
  console.log(f2);
};

// var g = gen();
// g.next().value.then(function(data){
//   g.next(data).value.then(function(data){
//     g.next(data);
//   });
// });

function run(gen){
  var g = gen();

  function next(data){
    var result = g.next(data);
    if (result.done) return result.value;
    result.value.then(function(data){
      next(data);
    });
  }

  next();
}

run(gen);
```
