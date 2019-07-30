# 伪数组和push方法
输出以下代码执行的结果并解释为什么？
```javascript
var obj = {
    '2': 3,
    '3': 4,
    'length': 2,
    'splice': Array.prototype.splice,
    'push': Array.prototype.push
}
obj.push(1)
obj.push(2)
console.log(obj)

// obj = [empty, empty, 1, 2, length: 4, splice: f, push: f]
```

## push
**push 是特意设计为通用的，Array.prototype.push 可以在一个对象上工作**
```javascript
var obj = {
    length: 0,
    addElem: function addElem (elem) {
        [].push.call(this, elem);
    }
};

obj.addElem(1);
obj.addElem(2);
console.log(obj.length);

// obj = {0: 1, 1: 2, length: 2, addElem: f}
```

**push 方法根据 length 属性来决定从哪里开始插入给定的值**
```javascript
var obj = {
    length: 1,
    addElem: function addElem (elem) {
        [].push.call(this, elem);
    }
};

obj.addElem(1);
obj.addElem(2);
console.log(obj.length);

// obj = {1: 1, 2: 2, length: 3, addElem: f}
```

## 伪数组
最后结果输出的是一个伪数组，如何判断伪数据？
1. 是对象
2. 对象上的splice 属性是函数类型
3. 对象上有 length 属性且为正整数

```javascript
  /**
   * @param {?Object} obj
   * @return {boolean}
   */
  function isArrayLike(obj) {
    if (!obj || typeof obj !== 'object')
      return false;
    try {
      if (typeof obj.splice === 'function') {
        const len = obj.length;
        return typeof len === 'number' && (len >>> 0 === len && (len > 0 || 1 / len > 0));
      }
    } catch (e) {
    }
    return false;
  }
```

## 参考
[输出以下代码执行的结果并解释为什么](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/76)
