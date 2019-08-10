# Symbol

## 1.概述
原始数据类型Symbol，表示独一无二的值

1. 接受字符串作为参数，表示对 Symbol 实例的描述。复杂类型会调用toString转为字符串
2. 可以转字符串
3. 可以转布尔值

## 2.Symbol.prototype.description
读取描述
```javascript
const sym = Symbol('foo');

String(sym) // "Symbol(foo)"
sym.toString() // "Symbol(foo)"
sym.description // "foo"
```

## 3.作为属性名的 Symbol
```javascript
let mySymbol = Symbol();

// 第一种写法
let a = {};
a[mySymbol] = 'Hello!';

// 第二种写法
let a = {
  [mySymbol]: 'Hello!'
};

// 第三种写法
let a = {};
Object.defineProperty(a, mySymbol, { value: 'Hello!' });

// 以上写法都得到同样结果
a[mySymbol] // "Hello!"
```

## 4.实例：消除魔术字符串
魔术字符串：在代码之中多次出现、与代码形成强耦合的某一个具体的字符串或者数值。消除魔术字符串的方法，就是把它写成一个变量
```javascript
function getArea(shape, options) {
  let area = 0;

  switch (shape) {
    case 'Triangle': // 魔术字符串
      area = .5 * options.width * options.height;
      break;
    /* ... more code ... */
  }

  return area;
}

getArea('Triangle', { width: 100, height: 100 }); // 魔术字符串


const shapeType = {
  triangle: Symbol()
};
function getArea(shape, options) {
  let area = 0;
  switch (shape) {
    case shapeType.triangle:
      area = .5 * options.width * options.height;
      break;
  }
  return area;
}

getArea(shapeType.triangle, { width: 100, height: 100 });
```

## 5.属性名的遍历
- Object.getOwnPropertySymbols
- Reflect.ownKeys

```javascript
let obj = {
  [Symbol('my_key')]: 1,
  enum: 2,
  nonEnum: 3
};

Object.getOwnPropertySymbols(obj) // [Symbol(my_key)]
Reflect.ownKeys(obj) // ["enum", "nonEnum", Symbol(my_key)]
```

## 6.Symbol.for()，Symbol.keyFor()
- Symbol.for()：返回已有的或者新建Symbol值（登记在全局环境中）
- Symbol()：返回新Symbol值（私有）
- Symbol.keyFor()：返回一个已登记的 Symbol 类型值的key（全局环境中）

```javascript
var a = Symbol('a')
var b = Symbol.for('a')

a === b // false
Symbol.keyFor(a) // undefined
Symbol.keyFor(b) // 'a'
```

## 6.内置的 Symbol 值
语言内部使用的方法

### 6.1 Symbol.hasInstance
instanceof运算符
```javascript
class MyClass {
  [Symbol.hasInstance](foo) {
    return foo instanceof Array;
  }
}

[1, 2, 3] instanceof new MyClass() // true
```

### 6.2 Symbol.isConcatSpreadable
表示该对象用于Array.prototype.concat()时，是否可以展开
```javascript
class A1 extends Array {
  constructor(args) {
    super(args);
    this[Symbol.isConcatSpreadable] = true;
  }
}
class A2 extends Array {
  constructor(args) {
    super(args);
  }
  get [Symbol.isConcatSpreadable] () {
    return false;
  }
}
let a1 = new A1();
a1[0] = 3;
a1[1] = 4;
let a2 = new A2();
a2[0] = 5;
a2[1] = 6;
[1, 2].concat(a1).concat(a2)
// [1, 2, 3, 4, [5, 6]]
```

### 6.3 Symbol.species
衍生对象的构造函数指向
```javascript
class MyArray extends Array {
  static get [Symbol.species]() { return Array; }
}

const a = new MyArray();
const b = a.map(x => x);

b instanceof MyArray // false
b instanceof Array // true
```

### 6.4 Symbol.match
当执行str.match(myObject)时，如果该属性存在，会调用它，返回该方法的返回值。
```javascript
class MyMatcher {
  [Symbol.match](string) {
    return 'hello world'.indexOf(string);
  }
}

'e'.match(new MyMatcher()) // 1
```

### 6.5 Symbol.replace
当该对象被String.prototype.replace方法调用时，会返回该方法的返回值
```javascript
const x = {};
x[Symbol.replace] = (...s) => console.log(s);

'Hello'.replace(x, 'World') // ["Hello", "World"]
```

### 6.6 Symbol.search
当该对象被String.prototype.search方法调用时，会返回该方法的返回值。
```javascript
class MySearch {
  constructor(value) {
    this.value = value;
  }
  [Symbol.search](string) {
    return string.indexOf(this.value);
  }
}
'foobar'.search(new MySearch('foo')) // 0
```

### 6.7 Symbol.split
当该对象被String.prototype.split方法调用时，会返回该方法的返回值。
```javascript
class MySplitter {
  constructor(value) {
    this.value = value;
  }
  [Symbol.split](string) {
    let index = string.indexOf(this.value);
    if (index === -1) {
      return string;
    }
    return [
      string.substr(0, index),
      string.substr(index + this.value.length)
    ];
  }
}

'foobar'.split(new MySplitter('foo'))
// ['', 'bar']

'foobar'.split(new MySplitter('bar'))
// ['foo', '']

'foobar'.split(new MySplitter('baz'))
// 'foobar'
```

### 6.8 Symbol.iterator
对象的Symbol.iterator属性，指向该对象的默认遍历器方法。
```javascript
const myIterable = {};
myIterable[Symbol.iterator] = function* () {
  yield 1;
  yield 2;
  yield 3;
};

[...myIterable] // [1, 2, 3]
```

### 6.9 Symbol.toPrimitive
该对象被转为原始类型的值时，会调用这个方法，返回该对象对应的原始类型值。
```javascript
let obj = {
  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'number':
        return 123;
      case 'string':
        return 'str';
      case 'default':
        return 'default';
      default:
        throw new Error();
     }
   }
};

2 * obj // 246
3 + obj // '3default'
obj == 'default' // true
String(obj) // 'str'
```

### 6.10 Symbol.toStringTag
这个属性可以用来定制[object Object]或[object Array]中object后面的那个字符串。
```javascript
({[Symbol.toStringTag]: 'Foo'}.toString())  // "[object Foo]"
```

### 6.11 Symbol.unscopables
对象指定了使用with关键字时，哪些属性会被with环境排除。
```javascript
// 没有 unscopables 时
class MyClass {
  foo() { return 1; }
}

var foo = function () { return 2; };

with (MyClass.prototype) {
  foo(); // 1
}

// 有 unscopables 时
class MyClass {
  foo() { return 1; }
  get [Symbol.unscopables]() {
    return { foo: true };
  }
}

var foo = function () { return 2; };

with (MyClass.prototype) {
  foo(); // 2
}
```
