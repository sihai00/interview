# Module的加载实现

## 1.浏览器加载
- defer：渲染完再执行，有序
- async：下载完就执行，无序
- type="module"：相当于defer，渲染完再执行，有序

```html
<script src="path/to/myModule.js" defer></script>
<script src="path/to/myModule.js" async></script>
<script type="module" src="./foo.js"></script>
```
模块脚本：
- 代码是在模块作用域之中运行，而不是在全局作用域运行。模块内部的顶层变量，外部不可见。
- 严格模式
- 提供import命令和export命令
- this等于undefined
- 同一个模块如果加载多次，将只执行一次

## 2.ES6 模块与 CommonJS 模块的差异
- CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用（单例）。
- CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。

```javascript
// lib.js
var counter = 3;
function incCounter() {
  counter++;
}
module.exports = {
  counter: counter,
  incCounter: incCounter,
};

// CommonJS 模块输出的是一个值的拷贝
// main.js
var mod = require('./lib');

console.log(mod.counter);  // 3
mod.incCounter();
console.log(mod.counter); // 3

// ES6 模块输出的是值的引用
// main.js
import { counter, incCounter } from './lib';
console.log(counter); // 3
incCounter();
console.log(counter); // 4
```

ES6输出引用是***单例***：export通过接口，输出的是同一个值。不同的脚本加载这个接口，得到的都是同样的实例
```javascript
// mod.js
function C() {
  this.sum = 0;
  this.add = function () {
    this.sum += 1;
  };
  this.show = function () {
    console.log(this.sum);
  };
}

export let c = new C();

// x.js
import {c} from './mod';
c.add();

// y.js
import {c} from './mod';
c.show();

// main.js
import './x';
import './y';

// 结果：1
```

## 3.Node加载
Node 的import命令是异步加载，require是同步加载
- 必须采用.mjs后缀名
- 顶层变量不存在
  - arguments
  - require
  - module
  - exports
  - __filename
  - __dirname
  
### 3.1 ES6 模块加载 CommonJS 模块
输出：
```javascript
// a.js
module.exports = {
  foo: 'hello',
  bar: 'world'
};

// 等同于
export default {
  foo: 'hello',
  bar: 'world'
};
```
输入：
```javascript
// 写法一
import baz from './a';
// baz = {foo: 'hello', bar: 'world'};

// 写法二
import {default as baz} from './a';
// baz = {foo: 'hello', bar: 'world'};

// 写法三
import * as baz from './a';
// baz.default = {foo: 'hello', bar: 'world'}
// baz = {
//   get default() {return module.exports;},
//   get foo() {return this.default.foo}.bind(baz),
//   get bar() {return this.default.bar}.bind(baz)
// }
```

- CommonJS 模块的输出缓存机制，在 ES6 加载方式下依然有效
- import命令加载 CommonJS 模块时，只能整体输入 

```javascript
module.exports = 123;
setTimeout(_ => module.exports = null);
// 一直是123

import { readFile } from 'fs';      //错误
import * as express from 'express'; // 正确
import express from 'express';      // 正确
```

### 3.2 CommonJS 模块加载 ES6 模块
不能使用require命令，而要使用import()函数
```javascript
// es.mjs
let foo = { bar: 'my-default' };
export default foo;

// cjs.js
const es_namespace = await import('./es.mjs');
// es_namespace = {
//   get default() {
//     ...
//   }
// }
console.log(es_namespace.default);
// { bar:'my-default' }
```

## 4.循环加载
a脚本的执行依赖b脚本，而b脚本的执行又依赖a脚本
```javascript
// a.js
var b = require('b');

// b.js
var a = require('a');
```

### 4.1 CommonJS 模块的加载原理
CommonJS 的一个模块，就是一个脚本文件。require命令第一次加载该脚本，在内存生成一个对象。再次加载该脚本时，直接从内存取该对象
```javascript
{
  id: '...',
  exports: { ... },
  loaded: true,
  ...
}
```

### 4.2 CommonJS 模块的循环加载
```javascript
// a.js
exports.done = false;
var b = require('./b.js');
console.log('在 a.js 之中，b.done = %j', b.done);
exports.done = true;
console.log('a.js 执行完毕');

// b.js
exports.done = false;
var a = require('./a.js');
console.log('在 b.js 之中，a.done = %j', a.done);
exports.done = true;
console.log('b.js 执行完毕');

// main.js
var a = require('./a.js');
var b = require('./b.js');
console.log('在 main.js 之中, a.done=%j, b.done=%j', a.done, b.done);

// 结果
// 在 b.js 之中，a.done = false
// b.js 执行完毕
// 在 a.js 之中，b.done = true
// a.js 执行完毕
// 在 main.js 之中, a.done=true, b.done=true
```
流程：
1. var a = require('./a.js')，缓存中生成a.js模块的对象
1. a.js的exports.done = false
2. 加载b.js，a.js暂停
3. b.js的exports.done = false
4. 加载a.js，直接读取缓存中a.js模块的对象
5. b.js的exports.done = true。b.js执行完毕，返回a.js
6. a.js的exports.done = true，a.js执行完毕

### 4.3 ES6 模块的循环加载
```javascript

// a.mjs
import {bar} from './b';
console.log('a.mjs');
console.log(bar);
export let foo = 'foo';

// b.mjs
import {foo} from './a';
console.log('b.mjs');
console.log(foo);
export let bar = 'bar';

// 执行a.mjs

// 结果：
// b.mjs
// ReferenceError: foo is not defined
```
1. 执行a.mjs以后，引擎发现它加载了b.mjs，因此会优先执行b.mjs
2. 执行b.mjs的时候，已知它从a.mjs输入了foo接口，这时不会去执行a.mjs，而是认为这个接口已经存在了，继续往下执行。
3. 执行到第三行console.log(foo)的时候，才发现这个接口根本没定义，因此报错

解决办法：声明的函数提升
```javascript
// a.mjs
import {bar} from './b';
console.log('a.mjs');
console.log(bar());
function foo() { return 'foo' }
export {foo};

// b.mjs
import {foo} from './a';
console.log('b.mjs');
console.log(foo());
function bar() { return 'bar' }
export {bar};

// 执行a.mjs
// b.mjs
// foo
// a.mjs
// bar
```

## 5.ES6 模块的转码
SystemJS：可以在浏览器内加载 ES6 模块、AMD 模块和 CommonJS 模块，将其转为 ES5 格式。它在后台调用的是 Google 的 Traceur 转码器。
