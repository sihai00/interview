# 手写instanceof

```javascript
function myInstanceof(left, right) {
  var prototype = right.prototype
  left = left.__proto__
  
  while(true) {
    if (left === null || left === undefined) return false
    if (left === prototype) return true
    
    left = left.__proto__  
  }
}
myInstanceof({}, Object)
```
