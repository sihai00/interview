# 实现flat函数
flat函数就是扁平化嵌套数组，例如：
```javascript
var arr1 = [1, 2, [3, 4]];
arr1.flat(); 
 // [1, 2, 3, 4]
```

## 1. Array.prototype.flat
```javascript
function flat(arr){
  return arr.flat(Infinity)
}
flat([1, [2, [3, [4, [5]]]]])
// [1, 2, 3, 4, 5]
```
## 2. 字符串化
```javascript
[1, [2, [3, [4, [5]]]]].toString().split(',').map(v => +v) 
// [1, 2, 3, 4, 5]
```

## 3.concat和reduce递归
```javascript
function flat(arr){
  return arr.reduce((pre, next) => pre.concat(Array.isArray(next) ? flat(next) : [next]), [])
}
flat([1, [2, [3, [4, [5]]]]]) 
// [1, 2, 3, 4, 5]
```

## 4.循环判断
```javascript
function flat(arr){
  if (!Array.isArray(arr)) return arr
  var res = []
  var stack = [...arr]
  while(stack.length) {
    var next = stack.shift()
    if (Array.isArray(next)) {
      stack.push(...next)
    } else {
      res.push(next)
    }
  }
  return res
}
flat([1, [2, [3, [4, [5]]]]])
```
