# Generator函数的语法

## 1.简介
Generator（生成器）函数除了状态机，还是一个遍历器对象生成函数

```javascript
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}

var hw = helloWorldGenerator();
hw.next() // { value: 'hello', done: false }
hw.next() // { value: 'world', done: false }
hw.next() // { value: 'ending', done: true }
hw.next() // { value: undefined, done: true }
```

### 1.1 yield 表达式
***yield只在Generator函数内部调用***
yield和return区别：
- yield：遇到yield，函数暂停执行，下一次再从该位置继续向后执行
- return：遇到return，函数直接返回，下面代码不执行

普通函数和Generator函数区别：
- 普通函数：调用直接执行
- Generator函数：调用next方法时才执行
  
```javascript
function* f() {
  console.log('执行了！')
}
console.log(1)
var generator = f();
console.log(2)
setTimeout(function () {
  console.log(3)
  generator.next()
}, 2000);

// 1
// 2
// 3
// 执行了！
```

## 1.2 与 Iterator 接口的关系
对象的***Symbol.iterator***方法，等于该对象的***遍历器生成函数***，调用该函数会返回该对象的一个***遍历器对象***。
```javascript
function* gen(){
  // some code
}

var g = gen();

g[Symbol.iterator]() === g
// true
```

## 2.next 方法的参数
1. yield表达式本身没有返回值，或者说总是返回***undefined***
2. next方法的参数表示***上一个yield表达式的返回值***（所以在第一次使用next方法时，传递参数是无效的）
```javascript
// 案例一
function* dataConsumer() {
  console.log('Started');
  console.log(`1. ${yield}`);
  console.log(`2. ${yield}`);
  return 'result';
}

let genObj = dataConsumer();
genObj.next();
// Started
genObj.next('a')
// 1. a
genObj.next('b')
// 2. b

// 案例二
function* foo(x) {
  var y = 2 * (yield (x + 1));
  var z = yield (y / 3);
  return (x + y + z);
}

var a = foo(5);
a.next() 
// 5 + 1 
// Object{value:6, done:false}
a.next() 
// y = (2 * undefined) = NaN
// z = NaN / 3 = NaN   
// Object{value:NaN, done:false}
a.next() 
// return 5 + NaN + undefined 
// Object{value:NaN, done:true}

var b = foo(5);
b.next()   
//  5 + 1                        
// { value:6, done:false }
b.next(12) 
// y = 24 
// z = y / 3 = 24 / 3 = 8     
// { value:8, done:false }
b.next(13) 
// return 5 + 24 + 13 = 42
// { value:42, done:true }
```

如果想要第一次就传参，可以封装函数，自动执行第一次
```javascript
function wrapper(generatorFunction) {
  return function (...args) {
    let generatorObject = generatorFunction(...args);
    generatorObject.next();
    return generatorObject;
  };
}

const wrapped = wrapper(function* () {
  console.log(`First input: ${yield}`);
  return 'DONE';
});

wrapped().next('hello!')
// First input: hello!
```

## 3.for...of 循环
for...of循环可以自动遍历 Generator 函数运行时生成的Iterator对象，且此时不再需要调用next方法
***done为true时结束遍历***
```javascript
// 注意：return 6 时，返回{value: 6, done: true}，遍历不包含该对象
function* foo() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
  return 6;
}

for (let v of foo()) {
  console.log(v);
}
// 1 2 3 4 5
```

## 4.Generator.prototype.throw()
throw方法，可以在函数体外抛出错误，然后在 Generator 函数体内捕获。

1. throw方法抛出的错误要被内部捕获，前提是***必须至少执行过一次next方法***。
2. throw方法
  - ***被捕获***：Generator函数会附带执行下一条yield表达式
  - 没有被内部捕获：Generator函数不会再执行下去
3. throw方法出错误，Generator函数体外也可以捕获

```javascript
var g = function* () {
  try {
    yield;
  } catch (e) {
    console.log('内部捕获', e);
  }
  yield console.log('执行')
};

var i = g();
i.next();

try {
  i.throw('a');
  i.throw('b');
} catch (e) {
  console.log('外部捕获', e);
}
// 内部捕获 a
// 执行
// 外部捕获 b
```

```javascript
// 没有被内部捕获：不会再执行下去
function* g() {
  yield 1;
  console.log('throwing an exception');
  throw new Error('generator broke!');
  yield 2;
  yield 3;
}

function log(generator) {
  var v;
  console.log('starting generator');
  try {
    v = generator.next();
    console.log('第一次运行next方法', v);
  } catch (err) {
    console.log('捕捉错误', v);
  }
  try {
    v = generator.next();
    console.log('第二次运行next方法', v);
  } catch (err) {
    console.log('捕捉错误', v);
  }
  try {
    v = generator.next();
    console.log('第三次运行next方法', v);
  } catch (err) {
    console.log('捕捉错误', v);
  }
  console.log('caller done');
}

log(g());
// starting generator
// 第一次运行next方法 { value: 1, done: false }
// throwing an exception
// 捕捉错误 { value: 1, done: false }
// 第三次运行next方法 { value: undefined, done: true }
// caller done
```

## 5.Generator.prototype.return()
return方法，可以返回给定的值，并且终结遍历 Generator 函数。
- 如果 Generator 函数内部有try...finally代码块，且正在执行try代码块，那么return方法会推迟到finally代码块执行完再执行。

```javascript
function* numbers () {
  yield 1;
  try {
    yield 2;
    yield 3;
  } finally {
    yield 4;
    yield 5;
  }
  yield 6;
}
var g = numbers();
g.next() // { value: 1, done: false }
g.next() // { value: 2, done: false }
g.return(7) // { value: 4, done: false }
g.next() // { value: 5, done: false }
g.next() // { value: 7, done: true }
g.next() // { value: undefined, done: true }
```

## 6.next()、throw()、return() 的共同点
它们的作用都是让 Generator 函数恢复执行，并且使用不同的语句替换yield表达式。

```javascript
const g = function* (x, y) {
  let result = yield x + y;
  return result;
};

const gen = g(1, 2);
gen.next(); // Object {value: 3, done: false}

gen.next(1); // Object {value: 1, done: true}
// 相当于将 let result = yield x + y
// 替换成 let result = 1;

gen.throw(new Error('出错了')); // Uncaught Error: 出错了
// 相当于将 let result = yield x + y
// 替换成 let result = throw(new Error('出错了'));

gen.return(2); // Object {value: 2, done: true}
// 相当于将 let result = yield x + y
// 替换成 let result = return 2;
```

## 7.yield* 表达式
在一个 Generator 函数里面执行另一个 Generator 函数。 
```javascript
function* foo() {
  yield 'a';
  yield 'b';
}

function* bar() {
  yield 'x';
  yield* foo();
  yield 'y';
}

// 等同于
function* bar() {
  yield 'x';
  yield 'a';
  yield 'b';
  yield 'y';
}

// 等同于
function* bar() {
  yield 'x';
  for (let v of foo()) {
    yield v;
  }
  yield 'y';
}

for (let v of bar()){
  console.log(v);
}
// "x"
// "a"
// "b"
// "y"

[bar()]
```

## 8.作为对象属性的 Generator 函数
```javascript
var obj = {
  * myGeneratorMethod() {
    ···
  }
};

var obj = {
  myGeneratorMethod: function* () {
    // ···
  }
};
```

## 9.Generator 函数的this
- 调用Generator函数返回的是遍历器对象，而不是this对象，所以Generator函数不能做构造函数

解决：
1. 要取Generator函数的属性，可以挂在其原型对象上
2. Generator函数返回的是遍历器对象，可以包装个外层函数
```javascript
// 让Generator 函数返回一个正常的对象实例，既可以用next方法，又可以获得正常的this
function* gen() {
  this.a = 1;
  yield this.b = 2;
  yield this.c = 3;
}

function F() {
  return gen.call(gen.prototype);
}

var f = new F();

f.next();  // Object {value: 2, done: false}
f.next();  // Object {value: 3, done: false}
f.next();  // Object {value: undefined, done: true}

f.a // 1
f.b // 2
f.c // 3
```

## 10.含义
### 10.1 Generator 与状态机
clock函数就是一个状态机

Generator 实现与 ES5 实现对比：
1. 少了用来保存状态的外部变量ticking
2. 简洁，更安全（状态不会被非法篡改）
3. 更符合函数式编程的思想
```javascript
// ES5
var ticking = true;
var clock = function() {
  if (ticking)
    console.log('Tick!');
  else
    console.log('Tock!');
  ticking = !ticking;
}

// Generator
var clock = function* () {
  while (true) {
    console.log('Tick!');
    yield;
    console.log('Tock!');
    yield;
  }
};
```
### 10.2 Generator 与协程
Generator 函数是 ES6 对协程的实现，但属于不完全实现。Generator 函数被称为“半协程”（semi-coroutine），意思是只有 Generator 函数的调用者，才能将程序的执行权还给 Generator 函数。如果是完全执行的协程，任何函数都可以让暂停的协程继续执行。

### 10.3 Generator 与上下文
1. Generator 函数一旦遇到yield命令，就会暂时退出堆栈，里面的所有变量和对象会冻结在当前状态。
2. 执行next命令时，这个上下文环境又会重新加入调用栈，冻结的变量和对象恢复执行

```javascript
function* gen() {
  yield 1;
  return 2;
}

let g = gen();

console.log(
  g.next().value,
  g.next().value,
);
```

1. 执行g.next()时，Generator 函数gen的上下文会加入堆栈，即开始运行gen内部的代码
2. 遇到yield 1时，gen上下文退出堆栈，内部状态冻结
3. 第二次执行g.next()时，gen上下文重新加入堆栈，变成当前的上下文，重新恢复执行

## 11.应用
### 11.1 异步操作的同步化表达
```javascript
function* main() {
  var result = yield request("http://some.url");
  var resp = JSON.parse(result);
    console.log(resp.value);
}

function request(url) {
  makeAjaxCall(url, function(response){
    // 当成功回调时，调用next继续
    it.next(response);
  });
}

var it = main();
it.next();
```

### 11.2 控制流管理
改善代码流程（同步）
```javascript
function* longRunningTask(value1) {
  try {
    var value2 = yield step1(value1);
    var value3 = yield step2(value2);
    var value4 = yield step3(value3);
    var value5 = yield step4(value4);
    // Do something with value4
  } catch (e) {
    // Handle any error from step1 through step4
  }
}

scheduler(longRunningTask(initialValue));

function scheduler(task) {
  var taskObj = task.next(task.value);
  // 如果Generator函数未结束，就继续调用
  if (!taskObj.done) {
    task.value = taskObj.value
    scheduler(task);
  }
}
```
```javascript
function* iterateSteps(steps){
  for (var i=0; i< steps.length; i++){
    var step = steps[i];
    yield step();
  }
}
function* iterateJobs(jobs){
  for (var i=0; i< jobs.length; i++){
    var job = jobs[i];
    yield* iterateSteps(job.steps);
  }
}
let jobs = [job1, job2, job3]
for (var step of iterateJobs(jobs)){
  console.log(step.id);
}
```

### 11.3 部署 Iterator 接口
```javascript
function* iterEntries(obj) {
  let keys = Object.keys(obj);
  for (let i=0; i < keys.length; i++) {
    let key = keys[i];
    yield [key, obj[key]];
  }
}

let myObj = { foo: 3, bar: 7 };

for (let [key, value] of iterEntries(myObj)) {
  console.log(key, value);
}

// foo 3
// bar 7
```
```javascript
function* makeSimpleGenerator(array){
  var nextIndex = 0;

  while(nextIndex < array.length){
    yield array[nextIndex++];
  }
}

var gen = makeSimpleGenerator(['yo', 'ya']);

gen.next().value // 'yo'
gen.next().value // 'ya'
gen.next().done  // true
```

### 11.4 作为数据结构
```javascript
function* doStuff() {
  yield fs.readFile.bind(null, 'hello.txt');
  yield fs.readFile.bind(null, 'world.txt');
  yield fs.readFile.bind(null, 'and-such.txt');
}

for (task of doStuff()) {
  // task是一个函数，可以像回调函数那样使用它
}

// es5
function doStuff() {
  return [
    fs.readFile.bind(null, 'hello.txt'),
    fs.readFile.bind(null, 'world.txt'),
    fs.readFile.bind(null, 'and-such.txt')
  ];
}
```
