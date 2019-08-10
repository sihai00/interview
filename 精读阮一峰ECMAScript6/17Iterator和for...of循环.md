# Iterator和for...of循环

## 1.Iterator（遍历器）的概念
Iterator 的作用有三个：
1. 提供一个统一的、简便的访问接口（***Symbol.iterator属性***）
2. 数据结构的成员能够按某种次序排列
3. Iterator接口主要供for...of消费

遍历器实现2中方法：
1. target[Symbol.iterator]必须返回{next: fn}对象，fn的返回值必须是{value, done: true || false}
2. Generator函数

```javascript
var it = makeIterator(['a', 'b']);

it.next() // { value: "a", done: false }
it.next() // { value: "b", done: false }
it.next() // { value: undefined, done: true }

function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function() {
      return nextIndex < array.length ?
        {value: array[nextIndex++], done: false} :
        {value: undefined, done: true};
    }
  };
}
```
流程：
1. 创建一个指针对象，指向当前数据结构的起始位置。也就是说，遍历器对象本质上，就是一个指针对象。
2. 第一次调用指针对象的next方法，可以将指针指向数据结构的第一个成员。
3. 第二次调用指针对象的next方法，指针就指向数据结构的第二个成员。
4. 不断调用指针对象的next方法，直到它指向数据结构的结束位置。

## 2.默认 Iterator 接口
原生具备 Iterator 接口的数据结构如下。
- Array
- Map
- Set
- String
- TypedArray
- 函数的 arguments 对象
- NodeList 对象

```javascript
// 案例一
let obj = {
  data: [ 'hello', 'world' ],
  [Symbol.iterator]() {
    const self = this;
    let index = 0;
    return {
      next() {
        if (index < self.data.length) {
          return {
            value: self.data[index++],
            done: false
          };
        } else {
          return { value: undefined, done: true };
        }
      }
    };
  }
};
for(let i of obj) {
  console.log(i)
}
// hello
// world

// 案例二：引用数组的遍历器
let iterable = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
  [Symbol.iterator]: Array.prototype[Symbol.iterator]
};
for (let item of iterable) {
  console.log(item); // 'a', 'b', 'c'
}
```

## 3.调用 Iterator 接口的场合
1. 解构赋值
2. 扩展运算符
3. yield*
4. 任何接受数组作为参数的场合，其实都调用了遍历器接口
  - for...of
  - Array.from()
  - Map(), Set(), WeakMap(), WeakSet()（比如new Map([['a',1],['b',2]])）
  - Promise.all()
  - Promise.race()

## 4.字符串的 Iterator 接口
```javascript
var str = new String("hi");

[...str] // ["h", "i"]

str[Symbol.iterator] = function() {
  return {
    next: function() {
      if (this._first) {
        this._first = false;
        return { value: "bye", done: false };
      } else {
        return { done: true };
      }
    },
    _first: true
  };
};

[...str] // ["bye"]
str // "hi"
```

## 5.Iterator 接口与 Generator 函数
```javascript
let myIterable = {
  [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
    yield 3;
  }
}
[...myIterable] // [1, 2, 3]

// 或者采用下面的简洁写法

let obj = {
  * [Symbol.iterator]() {
    yield 'hello';
    yield 'world';
  }
};

for (let x of obj) {
  console.log(x);
}
// "hello"
// "world"
```

## 6.遍历器对象的 return()，throw()
- return方法：for...of循环提前退出（通常是因为出错，或者有break语句）
```javascript
function readLinesSync() {
  return {
    [Symbol.iterator]() {
      return {
        next() {
          return { done: false, value: 1 };
        },
        return() {
          return { done: true };
        }
      };
    },
  };
}

// 情况一
for (let line of readLinesSync()) {
  console.log(line);
  break;
}

// 情况二
for (let line of readLinesSync()) {
  console.log(line);
  throw new Error();
}
```

## 7.for...of 循环
一个数据结构只要部署了Symbol.iterator属性，就被视为具有 iterator 接口，就可以用for...of循环遍历它的成员

### 7.1 数组 
- for...in循环读取键名
- for...of循环读取键值

for...of循环调用遍历器接口，数组的遍历器接口只返回***具有数字索引***的属性

```javascript
let arr = [3, 5, 7];
arr.foo = 'hello';

for (let i in arr) {
  console.log(i); // "0", "1", "2", "foo"
}

for (let i of arr) {
  console.log(i); //  "3", "5", "7"
}
```

### 7.2 Set 和 Map 结构
1. 顺序：添加进数据结构的顺序
2. Set 结构遍历时，返回的是一个值，而 Map 结构遍历时，返回的是一个数组

```javascript
var engines = new Set(["Gecko", "Trident", "Webkit", "Webkit"]);
for (var e of engines) {
  console.log(e);
}
// Gecko
// Trident
// Webkit

var es6 = new Map();
es6.set("edition", 6);
es6.set("committee", "TC39");
es6.set("standard", "ECMA-262");
for (var [name, value] of es6) {
  console.log(name + ": " + value);
}
// edition: 6
// committee: TC39
// standard: ECMA-262
```

### 7.3 计算生成的数据结构
- entries() 返回一个遍历器对象，用来遍历[键名, 键值]组成的数组。对于数组，键名就是索引值；对于 Set，键名与键值相同。Map 结构的 Iterator 接口，默认就是调用entries方法。
- keys() 返回一个遍历器对象，用来遍历所有的键名。
- values() 返回一个遍历器对象，用来遍历所有的键值。

```javascript
let arr = ['a', 'b', 'c'];
for (let pair of arr.entries()) {
  console.log(pair);
}
// [0, 'a']
// [1, 'b']
// [2, 'c']
```

### 7.4 类似数组的对象
1. 字符串（能够正确识别32位UTF-16字符）
2. DOM NodeList 对象
3. arguments对象

```javascript
// 字符串
let str = "hello";

for (let s of str) {
  console.log(s); // h e l l o
}

// DOM NodeList对象
let paras = document.querySelectorAll("p");
for (let p of paras) {
  p.classList.add("test");
}

// arguments对象
function printArgs() {
  for (let x of arguments) {
    console.log(x);
  }
}
printArgs('a', 'b');
// 'a'
// 'b'

let arrayLike = { length: 2, 0: 'a', 1: 'b' };
for (let x of Array.from(arrayLike)) {
  console.log(x); // a b
}
```

### 7.5 对象
普通的对象没有Iterator接口，只能使用for...in，解决办法：
1. Object.keys包装
2. Generator包装

```javascript
let es6 = {
  edition: 6,
  committee: "TC39",
  standard: "ECMA-262"
};

for (let e in es6) {
  console.log(e);
}
// edition
// committee
// standard

// Object.keys
for (var key of Object.keys(es6)) {
  console.log(key + ': ' + es6[key]);
}
// 6 
// 'TC39' 
// 'ECMA-262'

// Generator
function* entries(obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]];
  }
}
for (let [key, value] of entries(obj)) {
  console.log(key, '->', value);
}
// edition -> 6
// committee -> 'TC39' 
// standard -> 'ECMA-262'
```

### 7.6 与其他遍历语法的比较
forEach缺点：
- 无法跳出（break和continue无效）

for...in循环有几个缺点
- 键名自动转字符串：数组的键名是数字，但是for...in循环是以字符串作为键名“0”、“1”、“2”等等。
- 遍历原型链：for...in循环不仅遍历数字键名，还会遍历手动添加的其他键，甚至包括原型链上的键。
- 无序：某些情况下，for...in循环会以任意顺序遍历键名。

for...of
 -有着同for...in一样的简洁语法，但是没有for...in那些缺点。
 -不同于forEach方法，它可以与break、continue和return配合使用。
 -提供了遍历所有数据结构的统一操作接口。
