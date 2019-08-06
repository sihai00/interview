# let和const 命令

## 1.let 命令
1. 不存在变量提升
2. 暂时性死区
3. 不允许重复声明

### 1.1 不存在变量提升
```javascript
// var 的情况
console.log(foo); // 输出undefined
var foo = 2;

// let 的情况
console.log(bar); // 报错ReferenceError
let bar = 2;
```

### 1.2 暂时性死区
只要块级作用域内存在let命令，它所声明的变量就“绑定”（binding）这个区域。let命令声明变量之前，该变量都是不可用的。这在语法上，称为“暂时性死区”（temporal dead zone，简称 TDZ）
```javascript
if (true) {
  // TDZ开始
  tmp = 'abc'; // ReferenceError
  console.log(tmp); // ReferenceError

  let tmp; // TDZ结束
  console.log(tmp); // undefined

  tmp = 123;
  console.log(tmp); // 123
}
```
```javascript
// 函数参数的死区
function bar(x = y, y = 2) {
  return [x, y];
}

bar(); // 报错
```
```javascript
// 不报错
var x = x;

// 报错
let x = x;
// ReferenceError: x is not defined
```

### 1.3 不允许重复声明
```javascript
// 报错
function func() {
  let a = 10;
  var a = 1;
}

// 报错
function func() {
  let a = 10;
  let a = 1;
}
```
```javascript
function func(arg) {
  let arg;
}
func() // 报错

function func(arg) {
  {
    let arg;
  }
}
func() // 不报错
```

## 2.块级作用域
为什么需要块级作用域？因为内层变量可能会覆盖外层变量
```javascript
// 案例一
var tmp = new Date();

function f() {
  console.log(tmp);
  if (false) {
    var tmp = 'hello world';
  }
}

f(); // undefined
```
```javascript
// 案例二
var s = 'hello';

for (var i = 0; i < s.length; i++) {
  console.log(s[i]);
}

console.log(i); // 5
```

### 2.1 ES6的块级作用域
使用let即可创建块级作用域

### 2.2 块级作用域与函数声明
1. ES5规定：函数只能在顶层作用域和函数作用域之中声明，不能在块级作用域声明。（例外：浏览器为了兼容性，支持在块级作用域中声明函数）
2. ES6规定：允许在块级作用域之中声明函数，效果类似` let`。（例外：浏览器为了兼容性，***其函数声明类似于 `var`，即会提升到全局作用域或函数作用域的头部***）

```javascript
function f() { console.log('I am outside!'); }

(function () {
  // 在es6浏览器环境中的效果与var类似即：
  // var f = undefined;
  if (false) {
    // 重复声明一次函数f
    function f() { console.log('I am inside!'); }
  }

  f();
}());

// ES5浏览器环境：I am inside!
// ES6理论：I am outside!
// ES6浏览器环境：TypeError: f is not a function
```

### 2.3 注意
1. let只能出现在当前作用域的顶层
2. 严格模式下，函数只能声明在当前作用域的顶层

```javascript
// 报错
if (true) let x = 1;
```
```javascript
// 报错
'use strict';
if (true) function f() {}
```

## 3.const 命令
`const` 声明一个只读的常量，其值不可变。
特点：
1. ***必须立即初始化***。
2. 本质：指向的内存地址不可变。即简单类型的值不可变，复杂类型的数据结构是可变的

与 `let` 同样的：
1. 不存在变量提升
2. 暂时性死区
3. 不允许重复声明

```javascript
const foo = {};
foo.a = 1;       // 可执行
foo = 1;         // 报错
```

可以使用Object.freeze实现数据结构不可变（***只是能一层***）
```javascript
const foo = Object.freeze({a: {}});

// 常规模式时，下面一行不起作用；
// 严格模式时，该行会报错
foo.a = 1;

// 可行
foo.a.a = 1
```

## 4.注意点
### 4.1 ES6 声明变量的六种方法
1. var
2. function
3. let 
4. const
5. import
6. class

### 4.2 顶层对象的属性
1. var命令和function命令声明的全局变量，依旧是顶层对象的属性
2. let命令、const命令、class命令声明的全局变量，不属于顶层对象的属性

顶层对象的属性与全局变量挂钩，例如浏览器window对象，Node是global对象，其缺点：
1. 编译阶段无法变量未声明错误
2. 无意之中创建全局变量
3. 顶层对象到处可以读写的，不利于模块化编程
