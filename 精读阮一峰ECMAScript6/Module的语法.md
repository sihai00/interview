# Module的语法

## 1.概述
- CommonJS模块：对象，实质是运行时加载。输入时必须查找对象属性。
- ES6模块不是对象：实质是编译时加载或者静态加载。

```javascript
// CommonJS模块
let { stat, exists, readFile } = require('fs');

// 等同于
let _fs = require('fs');
let stat = _fs.stat;
let exists = _fs.exists;
let readfile = _fs.readfile;
```
CommonJs：
1. 整体加载fs模块
2. 生成一个对象（_fs）
3. 从这个对象上面读取方法

ES6：
从fs模块加载这3个方法，其他方法不加载

## 2.严格模式
ES6 的模块自动采用严格模式

## 3.export 命令
- 一个模块就是一个独立的文件
- 文件内部的所有变量，外部无法获取
- export 接口必须与模块内部的***变量***建立一一对应关系
- export 接口与其对应的值是动态绑定关系
- export 必须处于模块顶层

```javascript
export 1;               // 错误
export var m = 1;       // 正确
export function f() {}; // 正确

var m = 1;
export m;     // 错误
export {m};   // 正确

function f() {}
export f;     // 错误
export {f};   // 正确

// export必须处于模块顶层
function foo() {
  export default 'bar' // SyntaxError
}
foo()
```

## 4.import 命令
- 变量只读：输入的变量都是只读的
- 提升效果：会提升到整个模块的头部，首先执行
- 静态执行：不能使用表达式和变量
- 执行一次：多次重复执行同一句import语句，那么只会执行一次

```javascript
// 变量只读
import {a} from './xxx.js'
a = {};           // Syntax Error : 'a' is read-only;
a.foo = 'hello';  // 合法操作

// 提升效果
foo();
import { foo } from 'my_module';

// 静态执行
import { 'f' + 'oo' } from 'my_module'; // 报错
// 报错
if (x === 1) {
  import { foo } from 'module1';
} else {
  import { foo } from 'module2';
}
```
## 5.模块的整体加载
模块整体加载所在的那个对象是可以静态分析的，不允许运行时改变。
```javascript
// circle.js

export function area(radius) {
  return Math.PI * radius * radius;
}

export function circumference(radius) {
  return 2 * Math.PI * radius;
}

// main.js
import * as circle from './circle';

// 下面两行都是不允许的
circle.foo = 'hello';
circle.area = function () {};
```

## 6.export default 命令
本质上，export default就是输出一个叫做default的变量或方法。所以它后面不能跟变量声明语句。
```javascript
export default 42; // 正确
export 42;         // 报错

export var a = 1;         // 正确
export default var a = 1; // 错误

var a = 1;
export default a; // 正确
export a          // 错误
```

## 7.export 与 import 的复合写法
```javascript
export { foo, bar } from 'my_module';

// 可以简单理解为
import { foo, bar } from 'my_module';
export { foo, bar };
```
foo和bar实际上并没有被导入当前模块，只是相当于对外转发了这两个接口，导致当前模块不能直接使用foo和bar

## 8.模块的继承
```javascript
export * from 'circle';
export var e = 2.71828182846;
export default function(x) {
  return Math.exp(x);
}
```

## 9.跨模块常量
```javascript
// constants/db.js
export const db = {
  url: 'http://my.couchdbserver.local:5984',
  admin_username: 'admin',
  admin_password: 'admin password'
};

// constants/user.js
export const users = ['root', 'admin', 'staff', 'ceo', 'chief', 'moderator'];

// constants/index.js
export {db} from './db';
export {users} from './users';

// script.js
import {db, users} from './constants/index';
```

## 10.import()
动态加载，相当于Node中的require。import()返回一个 Promise 对象
```javascript
const main = document.querySelector('main');

import(`./section-modules/${someVariable}.js`)
  .then(module => {
    module.loadPageInto(main);
  })
  .catch(err => {
    main.textContent = err.message;
  });
```

适合场景：
1. 按需加载
2. 条件加载
3. 动态的模块路径
