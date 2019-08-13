# 手写new
使用 new 创建对象的步骤
1. 创建一个新对象
2. 将构造函数的作用域赋给新对象
3. 执行构造函数中的代码（为这个新对象添加属性）
4. 返回新对象

注意：
1. 构造函数没有返回值或者返回基础类型，返回构造函数实例
2. 构造函数返回复杂类型，实例为这个复杂类型

```javascript
function newObj () {
  var obj = new Object()
  var Constructor = [].shift.call(arguments)
  obj.__proto__ = Constructor.prototype
  var result = Constructor.apply(obj, arguments)
  return typeof result === 'object' ? result : obj
}
function Otaku (name, age) {
    this.strength = 60;
    this.age = age;

    return 'handsome boy';
}

var person = new Otaku('Kevin', '18');

console.log(person.name) // undefined
console.log(person.habit) // undefined
console.log(person.strength) // 60
console.log(person.age) // 18
```
