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


