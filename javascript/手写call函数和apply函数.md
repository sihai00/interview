# 手写call函数和apply函数

## call

问题：
1. this：使用对象属性解决
2. 传参：eval('[1,2,3]')解决
3. 上下文默认window
4. 返回修改值

```javascript
function man(name, age){
  return {
    name: name,
    age: age,
    sex: this.sex
  }
}
Function.prototype.call2 = function(context) {
  var context = context || window
  context.fn = this
  
  var args = []
  for (var i = 0; i < arguments.length; i++) {
    args.push('arguments[' + i + ']')
  }
  
  var result = eval('context.fn(' + args + ')')
  delete context.fn
  return result
}
var obj = {sex: 'man'}
man.call2(obj, 'sihai', '18')
```

## apply
```javascript
function man(name, age){
  return {
    name: name,
    age: age,
    sex: this.sex
  }
}
Function.prototype.apply2 = function(context, arr) {
  var context = context || window
  context.fn = this
 
  var result
  if (!arr) {
    result = eval('context.fn()')
  } else {
    var args = []
    for (var i = 0; i < arr.length; i++) {
      args.push('arr[' + i + ']')
    } 
    result = eval('context.fn(' + arr + ')')
  }
  delete context.fn
  return result
}
var obj = {sex: 'man'}
man.apply2(obj, ['sihai', '18'])
```

## 参考
[JavaScript深入之call和apply的模拟实现](https://github.com/mqyqingfeng/Blog/issues/11)
