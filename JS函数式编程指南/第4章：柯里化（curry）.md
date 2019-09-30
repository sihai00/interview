# 第4章：柯里化（curry）
只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数
- 延迟函数的执行
- 语义化 

```javascript
var add = function(x) {
  return function(y) {
    return x + y;
  };
};

// 语义化
var increment = add(1);
var addTen = add(10);

increment(2);
// 3

addTen(2);
// 12
```

## 参考
- [第4章：柯里化（curry）](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/ch4.html#不仅仅是双关语咖喱)
