# 实现flat函数
flat函数就是扁平化嵌套数组，例如：
```javascript
var arr1 = [1, 2, [3, 4]];
arr1.flat(); 
 // [1, 2, 3, 4]
```

## 1.Array.prototype.flat
```javascript
function flat(arr){
  return arr.flat(Infinity)
}
flat([1, [2, [3, [4, [5]]]]])
// [1, 2, 3, 4, 5]
```

## 2.字符串化
```javascript
[1, [2, [3, [4, [5]]]]].toString().split(',').map(v => +v) 
// [1, 2, 3, 4, 5]
```
缺点：数字和字符串夹杂的数组无法使用

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
```javascript
var arr = [1, [2, [3, 4]]];

function flatten(arr) {
  while (arr.some(item => Array.isArray(item))) {
    arr = [].concat(...arr);
  }
  return arr;
}

console.log(flatten(arr))
```

## 5.undercore
```javascript
/**
 * 数组扁平化
 * @param  {Array} input   要处理的数组
 * @param  {boolean} shallow 是否只扁平一层
 * @param  {boolean} strict  是否严格处理元素，下面有解释
 * @param  {Array} output  这是为了方便递归而传递的参数
 * 源码地址：https://github.com/jashkenas/underscore/blob/master/underscore.js#L528
 */
function flatten(input, shallow, strict, output) {
  var output = output || []
  var idx = output.length
  
  for (var i = 0, len = input.length; i < len; i++) {
    var value = input[i]
    if (Array.isArray(value)) {
      if (shallow) {
        var j = 0; 
        var length = value.length
        while(j < length) output[idx++] = value[j++]
      } else {
        output[idx] = flatten(value, shallow, strict, output)
        idx = output.length
      }
    } else if (!strict) {
      output[idx++] = value
    }
  } 
  
  return output
}

// 正常扁平化
var _flatten = function(array, shallow) {
  return flatten(array, shallow, false);
};

// 交集 _union([1, 2, 3], [101, 2, 1, 10], 4, 5) => [1, 2, 3, 101, 10]
function unique(array) {
 return Array.from(new Set(array));
}
var _union = function() {
  return unique(flatten(arguments, true, true));
}

// 差集 _difference([1, 2, 3, 4, 5], [5, 2, 10], [4], 3) => [1, 3]
function difference(array, ...rest) {
  rest = flatten(rest, true, true);
  return array.filter(function(item){
    return rest.indexOf(item) === -1;
  })
}
```
