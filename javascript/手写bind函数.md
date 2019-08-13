# 手写bind函数

1. bind函数可以传参数
2. bind函数返回一个函数
3. 返回的函数可以当构造函数（那么绑定的对象失效）
4. 返回的函数可以继续传剩下的参数

```javascript
var sex = 'woman';

var obj = { sex: 'man' };

function man(name, age) {
  this.habit = 'shopping';
  console.log(this.value);
  console.log(name);
  console.log(age);
}

man.prototype.friend = 'kevin';

var bindFoo = man.bind(foo, 'daisy');

var obj = new bindFoo('18');
// undefined
// daisy
// 18
console.log(obj.habit);
console.log(obj.friend);
// shopping
// kevin
```

## 代码
```javascript
Function.prototype.bind2 = function(context) {
  if (typeof this !== "function") {
    throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
  }

  var args = Array.prototype.slice.call(arguments, 1)
  var self = this
  
  var c = function () {}
  var bound = function () {
    var bindArgs = Array.prototype.slice.call(arguments)
    self.apply(this instanceof bound ? this : context, args.concat(bindArgs))
  }
  c.prototype = this.prototype
  bound.prototype = new c()
  return bound
}
var sex = 'woman';

var obj = { sex: 'man' };

function man(name, age) {
  this.habit = 'shopping';
  console.log(this.value);
  console.log(name);
  console.log(age);
}

man.prototype.friend = 'kevin';

var bindFoo = man.bind(foo, 'daisy');

var obj = new bindFoo('18');
```
