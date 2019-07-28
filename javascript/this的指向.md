1. 默认绑定：this绑定windows
2. 隐式绑定：对象的方法
3. 显式绑定：apply、call、bind
4. new绑定

```javascript
// 1. 默认绑定
function foo(){
  console.info(this.a)
}
var a = 'hello'
foo()

// 2.隐式绑定
var obj = {
  a: 1,
  foo:  function() { console.log(this.a) }
}
obj.foo()

// 3. 显式绑定
var obj = {
  a: 1,
  foo:  function() { console.log(this.a) }
}
obj.foo.call({a: 2})
obj.foo.apply({a: 2})
var b = obj.foo.bind({a: 2})
b()

// 4. new绑定
function a(name){
  this.name = name
}
new a('a')
```
