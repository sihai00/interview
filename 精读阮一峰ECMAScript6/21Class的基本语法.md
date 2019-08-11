# Class的基本语法

## 1.简介
1. 类的内部所有定义的方法，都是***不可枚举***的
```javascript
// ES5
function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.toString = function () {
  return '(' + this.x + ', ' + this.y + ')';
};

var p = new Point(1, 2);

// ES6
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }
}
```

### 1.1 constructor 方法
构造方法
1. constructor方法默认添加
2. 类不能单独调用。类用new调用时会自动调用constructor方法

```javascript
class Point {
}

// 等同于
class Point {
  constructor() {}
}
```

### 1.2 类的实例
### 1.3 取值函数（getter）和存值函数（setter）
- 存值函数和取值函数是设置在属性的 Descriptor 对象上的
```javascript
class MyClass {
  constructor() {
    // ...
  }
  get prop() {
    return 'getter';
  }
  set prop(value) {
    console.log('setter: '+value);
  }
}

let inst = new MyClass();

inst.prop = 123;
// setter: 123

inst.prop
// 'getter'
```
```javascript
class CustomHTMLElement {
  constructor(element) {
    this.element = element;
  }

  get html() {
    return this.element.innerHTML;
  }

  set html(value) {
    this.element.innerHTML = value;
  }
}

var descriptor = Object.getOwnPropertyDescriptor(
  CustomHTMLElement.prototype, "html"
);

"get" in descriptor  // true
"set" in descriptor  // true
```

### 1.4 属性表达式
```javascript
let methodName = 'getArea';

class Square {
  constructor(length) {
    // ...
  }

  [methodName]() {
    // ...
  }
}
```

### 1.5 Class 表达式
- 使用了表达式的形式定义，类名只能在类内部使用
- 使用了表达式的形式定义，可以立即执行

```javascript
let inst = new MyClass();
inst.getClassName() // Me
Me.name // ReferenceError: Me is not defined
```
```javascript
let person = new class {
  constructor(name) {
    this.name = name;
  }

  sayName() {
    console.log(this.name);
  }
}('张三');

person.sayName(); // "张三"
```

### 1.6 注意点
- 默认就是严格模式
- 不存在提升
- name 属性：name属性总是返回紧跟在class关键字后面的类名
- Generator 方法
- this 的指向：用表达式在类外部调用使用this的原型方法，this指向错误
  - bind：绑定this
  - 箭头函数：指定this
  - Proxy：拦截方法绑定this

```javascript
// 4. Generator 方法
class Foo {
  constructor(...args) {
    this.args = args;
  }
  * [Symbol.iterator]() {
    for (let arg of this.args) {
      yield arg;
    }
  }
}

for (let x of new Foo('hello', 'world')) {
  console.log(x);
}
// hello
// world
```
```javascript
// 5. this 的指向
class Logger {
  constructor() {
    // 注意：printName1会变成实例的方法
    this.printName1 = this.printName1.bind(this);
  }
  print(text) {
    console.log(text);
  }
  // 注意：printName是原型链上的方法
  printName(name = 'there') {
    this.print(`Hello ${name}`);
  }
  printName1(name = 'there') {
    this.print(`Hello ${name}`);
  }
  // 注意：printName2会变成实例的方法
  printName2 = (name = 'there') => {
    this.print(`Hello ${name}`);
  }
}

const logger = new Logger();
const { printName, printName1, printName2 } = logger;
printName(); // TypeError: Cannot read property 'print' of undefined
// bind：绑定this
printName1() // Hello there
// 箭头函数：指定this
printName2() // Hello there

// Proxy：拦截方法绑定this
function selfish (target) {
  const cache = new WeakMap();
  const handler = {
    get (target, key) {
      const value = Reflect.get(target, key);
      if (typeof value !== 'function') {
        return value;
      }
      if (!cache.has(value)) {
        cache.set(value, value.bind(target));
      }
      return cache.get(value);
    }
  };
  const proxy = new Proxy(target, handler);
  return proxy;
}

const logger = selfish(new Logger());
const { printName } = logger;
printName(); // Hello there
```

## 2.静态方法
类中在一个方法前，加上static关键字，就表示该方法不会被实例继承，而是直接通过类来调用，这就称为“静态方法”。
- 可以直接在类上调用（***不是类的实例***）
- 不能被***实例***继承
- 可以被***子类***继承
```javascript
class Foo {
  static classMethod() {
    return 'hello';
  }
}

Foo.classMethod() // 'hello'

var foo = new Foo();
foo.classMethod()
// TypeError: foo.classMethod is not a function
```

## 3.实例属性的新写法
```javascript
class foo {
  bar = 'hello';
  baz = 'world';

  constructor() {
    // 效果一样
    // this.bar = 'hello'
    // this.baz = 'world'
  }
}
```

## 4.静态属性
静态属性指的是 Class 本身的属性（注意：新写法只是个提案）
```javascript
// 老写法
class Foo {
  // ...
}
Foo.prop = 1;

// 新写法
class Foo {
  static prop = 1;
}
```

## 5.私有方法和私有属性
只能在类的内部使用。在属性名之前，使用#表示（实测Chrome暂时只支持私有属性不支持私有方法）
```javascript
class FakeMath {
  static PI = 22 / 7;
  static #totallyRandomNumber = 4;

  static #computeRandomNumber() {
    return FakeMath.#totallyRandomNumber;
  }

  static random() {
    console.log('I heard you like random numbers…')
    return FakeMath.#computeRandomNumber();
  }
}

FakeMath.PI // 3.142857142857143
FakeMath.random()
// I heard you like random numbers…
// 4
FakeMath.#totallyRandomNumber // 报错
FakeMath.#computeRandomNumber() // 报错
```

## 6.new.target 属性
该属性一般用在构造函数之中，返回new命令作用于的那个构造函数
- 子类继承父类时，new.target会返回子类

```javascript
class Shape {
  constructor() {
    if (new.target === Shape) {
      throw new Error('本类不能实例化');
    }
  }
}

class Rectangle extends Shape {
  constructor(length, width) {
    super();
    // ...
  }
}

var x = new Shape();  // 报错
var y = new Rectangle(3, 4);  // 正确
```
