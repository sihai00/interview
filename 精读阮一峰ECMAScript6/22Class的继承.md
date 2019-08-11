# Class的继承

## 1.简介
Class 可以通过extends关键字实现继
- 子类必须在constructor方法中调用super方法
- 父类的静态方法，也会被子类继承

ES5继承和ES6继承的区别：
- ES5：先创造子类的实例对象this，然后再将父类的方法添加到this上面（Parent.apply(this)）
- ES6：先将父类实例对象的属性和方法，加到this上面（所以必须先调用super方法），然后再用子类的构造函数修改this

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class ColorPoint extends Point {
  constructor(x, y, color) {
    this.color = color; // ReferenceError
    super(x, y);
    this.color = color; // 正确
  }
}

// super == Point.prototype.constructor.call(this) this是ColorPoint的实例
```

## 2.Object.getPrototypeOf()
Object.getPrototypeOf方法可以用来从子类上获取父类。
```javascript
Object.getPrototypeOf(ColorPoint) === Point
```

## 3.super 关键字
1. 当作函数使用：super作为函数调用时，代表父类的构造函数（相当于 `A.prototype.constructor.call(this)` ）
2. 当作对象使用：
    - 在普通方法中，指向父类的原型对象（this指向子类实例）
    - 在静态方法中，指向父类（this指向子类）
3. 由于对象总是继承其他对象的，所以可以在任意一个对象中，使用super关键字

```javascript
// 当作函数使用：super作为函数调用时，代表父类的构造函数
class A {
  constructor() {
    console.log(new.target.name);
  }
}
class B extends A {
  constructor() {
    // A.prototype.constructor.call(this)
    super();
  }
}
new A() // A
new B() // B
```
```javascript
// 当作对象使用
// 在普通方法中，指向父类的原型对象（this指向子类实例）
class A {
  constructor() {
    this.x = 1;
  }
  print() {
    console.log(this.x);
  }
}

class B extends A {
  constructor() {
    super();
    this.x = 2
    // super.x = 3 
  }
  m() {
    super.print();
  }
}

let b = new B();
b.m() // 2 || 当调用 super.x = 3 时，结果为3。

// 在静态方法中，指向父类（this指向子类）
class A {
  constructor() {
    this.x = 1;
  }
  static print() {
    console.log(this.x);
  }
}

class B extends A {
  constructor() {
    super();
    this.x = 2;
  }
  static m() {
    super.print();
  }
}

B.x = 3;
B.m() // 3
```
```javascript
// 由于对象总是继承其他对象的，所以可以在任意一个对象中，使用super关键字
var obj = {
  toString() {
    return "MyObject: " + super.toString();
  }
};

obj.toString(); // MyObject: [object Object]
```

## 4. 类的 prototype 属性和__proto__属性
- 子类的__proto__属性（构造函数），表示构造函数的继承，总是指向父类。
- 子类prototype属性的__proto__属性（原型对象），表示方法的继承，总是指向父类的prototype属性。

```javascript
class A {}
class B extends A {}

B.__proto__ === A // true
B.prototype.__proto__ === A.prototype // true

// 实质
Object.setPrototypeOf(B.prototype, A.prototype);
Object.setPrototypeOf(B, A);
```

## 5.原生构造函数的继承
原生构造函数：
- Boolean()
- Number()
- String()
- Array()
- Date()
- Function()
- RegExp()
- Error()
- Object()

区别：
- ES5：无法继承原生构造函数。因为ES5 是先新建子类的实例对象this，再将父类的属性添加到子类上，由于父类的内部属性无法获取，导致无法继承原生的构造函数
- ES6：可以继承原生构造函数。因为 ES6 是先新建父类的实例对象this，然后再用子类的构造函数修饰this，使得父类的所有行为都可以继承

```javascript
// ES5继承原生构造函数
function MyArray() {
  Array.apply(this, arguments);
}

MyArray.prototype = Object.create(Array.prototype, {
  constructor: {
    value: MyArray,
    writable: true,
    configurable: true,
    enumerable: true
  }
});
var colors = new MyArray();
colors[0] = "red";
colors.length  // 0

colors.length = 0;
colors[0]  // "red"


// ES6继承原生构造函数
class MyArray extends Array {
  constructor(...args) {
    super(...args);
  }
}

var arr = new MyArray();
arr[0] = 12;
arr.length // 1

arr.length = 0;
arr[0] // undefined
```

注意，继承Object的子类，有一个行为差异。Object方法不是通过new Object()这种形式调用，ES6 规定Object构造函数会忽略参数
```javascript
class NewObj extends Object{
  constructor(){
    super(...arguments);
  }
}
var o = new NewObj({attr: true});
o.attr === true  // false
```

## 6.Mixin 模式的实现
Mixin 指的是多个对象合成一个新的对象
```javascript
const a = {
  a: 'a'
};
const b = {
  b: 'b'
};
const c = {...a, ...b}; // {a: 'a', b: 'b'}
```

将多个类的接口“混入”（mix in）另一个类
```javascript
function mix(...mixins) {
  class Mix {
    constructor() {
      for (let mixin of mixins) {
        copyProperties(this, new mixin()); // 拷贝实例属性
      }
    }
  }

  for (let mixin of mixins) {
    copyProperties(Mix, mixin); // 拷贝静态属性
    copyProperties(Mix.prototype, mixin.prototype); // 拷贝原型属性
  }

  return Mix;
}

function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if ( key !== 'constructor'
      && key !== 'prototype'
      && key !== 'name'
    ) {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}
```
