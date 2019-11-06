# Tree-shaking
作用：消除无用的js代码
原理：通过ES6模块的静态分析，得到引用关系。痛过程序流分析，判断哪些变量未被使用、引用，进而删除此代码

- UglifyJS：消除不会执行的代码
    - 缺点：无法消除无用的引用
- tree-shaking：找出无用的引用模块，通过搭配UglifyJS消除无用的模块的引用。例如：`import {post} from xxx`
    - 问题：Tree-shaking + UglifyJS + babel6（失效）
    - 原因：UglifyJS没有完善的程序流分析，无法剔除立即执行函数（babel6中将ES6语法转化为ES5语法会套上立即执行函数，有可能会产生副作用，所以不剔除，导致树摇失效）
    - 解决：
        - Babel6在转化时使用宽松的模式：只是把IIFE换成原型链模式实现，没有解决根本问题，依然不能消除
        - 升级babel7：可用
        - sideEffects：无副作用，可安全剔除（立即执行函数等）
- terser-webpack-plugin：可解决UglifyJS问题

## 1.Tree-shaking问题
### 1.1 不会清楚IIFE
因为IIFE比较特殊，它在被翻译时(JS并非编译型的语言)就会被执行，Webpack不做程序流分析，有可能会产生副作用，所以不会删除这部分代码
```js
//App.js
import { cube } from './utils.js';
console.log(cube(2));

//utils.js
var square = function(x) {
  console.log('square');
}();

export function cube(x) {
  console.log('cube');
  return x * x * x;
}
```
打包结果
```js
function(e, t, n) {
  "use strict";
  n.r(t);
  console.log("square");
  console.log(function(e) {
    return console.log("cube"), e * e * e
  }(2))
}
```

## 1.2 引用模块的问题
```js
//App.js
import { Add } from './utils'
Add(1 + 2);

//utils.js
import { isArray } from 'lodash-es';

export function array(array) {
  console.log('isArray');
  return isArray(array);
}

export function Add(a, b) {
  console.log('Add');
  return a + b
}
```
这个`array`函数未被使用，但是lodash-es这个包的部分代码还是会被build到bundle.js中

## 1.3 Tree-shaking + babel6
babel6把类转换成包裹IIFE，导致树摇失效
```js
// componetns.js
export class Person {
  constructor ({ name, age, sex }) {
    this.className = 'Person'
    this.name = name
    this.age = age
    this.sex = sex
  }
  getName () {
    return this.name
  }
}
```
babel6转换结果
```js
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _createClass = function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0,
      "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps),
    Constructor;
  };
}()

var Person = function () {
  function Person(_ref) {
    var name = _ref.name, age = _ref.age, sex = _ref.sex;
    _classCallCheck(this, Person);

    this.className = 'Person';
    this.name = name;
    this.age = age;
    this.sex = sex;
  }

  _createClass(Person, [{
    key: 'getName',
    value: function getName() {
      return this.name;
    }
  }]);
  return Person;
}();
```

### 1.4 引用的第三方模块不是ES6模块
- 第三方模块不是ES6模块，那么无法树摇，选择些第三方同时存在ES5和ES6的版本
- 同时在packages.json中设置入口配置，就可以让Webpack优先读取ES6的文件
```js
//package.json
"main": "lib/redux.js",
"unpkg": "dist/redux.js",
"module": "es/redux.js",
"typings": "./index.d.ts",
```

## 参考
- [Tree-Shaking性能优化实践 - 原理篇](https://juejin.im/post/5a4dc842518825698e7279a9#heading-0)
- [Webpack Tree shaking 深入探究](https://juejin.im/post/5bb8ef58f265da0a972e3434#heading-0)
- [你的Tree-Shaking并没什么卵用](https://juejin.im/post/5a5652d8f265da3e497ff3de#heading-0)
