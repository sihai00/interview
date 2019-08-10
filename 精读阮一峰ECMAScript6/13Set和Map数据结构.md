# Set和Map数据结构

## 1.Set
类似于数组，但是成员的值都是唯一的，没有重复的值。

```javascript
var arr = [1,1,2,3]
[...new Set(arr)]         // [1, 2, 3]
Array.from(new Set(arr))  // [1, 2, 3]

[...new Set('ababbc')].join('') // abc
```

### 1.1 Set 实例的属性和方法
属性：
- Set.prototype.constructor：构造函数，默认就是Set函数。
- Set.prototype.size：返回Set实例的成员总数。

方法：
- Set.prototype.add(value)：添加某个值，返回 Set 结构本身。
- Set.prototype.delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。
- Set.prototype.has(value)：返回一个布尔值，表示该值是否为Set的成员。
- Set.prototype.clear()：清除所有成员，没有返回值。

### 1.2 遍历操作
- Set.prototype.keys()：返回键名的遍历器
- Set.prototype.values()：返回键值的遍历器
- Set.prototype.entries()：返回键值对的遍历器
- Set.prototype.forEach()：使用回调函数遍历每个成员

```javascript
let a = new Set([1, 2, 3]);
let b = new Set([4, 3, 2]);

// 并集
let union = new Set([...a, ...b]);
// Set {1, 2, 3, 4}

// 交集
let intersect = new Set([...a].filter(x => b.has(x)));
// set {2, 3}

// 差集
let difference = new Set([...a].filter(x => !b.has(x)));
// Set {1}
```

## 2.WeakSet
WeakSet 结构与 Set 类似
- 成员只能是***对象***
- 没有size属性，不可遍历
- 不计入垃圾回收机制

方法：
- WeakSet.prototype.add(value)：向 WeakSet 实例添加一个新成员。
- WeakSet.prototype.delete(value)：清除 WeakSet 实例的指定成员。
- WeakSet.prototype.has(value)：返回一个布尔值，表示某个值是否在 WeakSet 实例之中。

```javascript
// 是a数组的成员成为 WeakSet 的成员，而不是a数组本身
const a = [[1, 2], [3, 4]];
const ws = new WeakSet(a);
// WeakSet {[1, 2], [3, 4]}
```

## 3.Map
它类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键
1. +0 == -0
2. NaN == NaN
```javascript
const map = new Map([
  ['foo', 1],
  ['bar', 2]
])

new Map(new Set([
  ['foo', 1],
  ['bar', 2]
]))

let map = new Map();

map.set(-0, 123);
map.get(+0) // 123

map.set(true, 1);
map.set('true', 2);
map.get(true) // 1

map.set(undefined, 3);
map.set(null, 4);
map.get(undefined) // 3

map.set(NaN, 123);
map.get(NaN) // 123
```

### 3.1 实例的属性和操作方法
属性：
- size

方法：
- Map.prototype.set(key, value)
- Map.prototype.get(key)
- Map.prototype.has(key)
- Map.prototype.delete(key)
- Map.prototype.clear()

### 3.2 遍历方法
- Map.prototype.keys()：返回键名的遍历器。
- Map.prototype.values()：返回键值的遍历器。
- Map.prototype.entries()：返回所有成员的遍历器。
- Map.prototype.forEach()：遍历 Map 的所有成员。

### 3.3 与其他数据结构的互相转换
1. Map转为数组
  1. 扩展运算符
  2. Array.from
```javascript
var map = new Map([['a', 1], ['b', 2]])

// 扩展运算符
[...map]

// Array.from
Array.from(map)
```
  
2. 数组转Map
  1. Map构造函数
```javascript
var map = new Map([['a', 1], ['b', 2]])
```

3. Map转为对象
  1. 遍历
```javascript
function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
    obj[k] = v;
  }
  return obj;
}

var map = new Map([['a', 1], ['b', 2]])
strMapToObj(map)
```
4. 对象转为 Map
  1. 遍历
```javascript
function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}

objToStrMap({a: 1, b: 2})
```

5. Map转为JSON
  1. Map 的键名都是字符串：转为对象 JSON
  2. Map 的键名有非字符串：转为数组 JSON
```javascript
function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
    obj[k] = v;
  }
  return obj;
}
function strMapToJson(strMap) {
  return JSON.stringify(strMapToObj(strMap));
}

var map = new Map([['a', 1], ['b', 2]])
strMapToJson(myMap)
// '{"a":1,"b":2}'

function mapToArrayJson(map) {
  return JSON.stringify([...map]);
}
mapToArrayJson(myMap)
// '[["a",1],["b",2]]'
```

6. JSON 转为 Map
  1. 键名都是字符串
  2. 整个 JSON 就是一个数组，且每个数组成员本身，又是一个有两个成员的数组
```javascript
function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}
function jsonToStrMap(jsonStr) {
  return objToStrMap(JSON.parse(jsonStr));
}

jsonToStrMap('{"a": 1, "b": 2}')
// Map {'a' => 1, 'b' => 2}

function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr));
}

jsonToMap('[["a",1],["b",2]]')
// Map {'a' => 1, 'b' => 2}
```

## 4.WeakMap
WeakMap结构与Map结构类似
- 只接受对象作为键名
- 不计入垃圾回收机制

WeakMap 弱引用的只是键名，而不是键值。键值依然是正常引用。
```javascript
const wm = new WeakMap();
let key = {};
let obj = {foo: 1};

wm.set(key, obj);
obj = null;
wm.get(key)
// Object {foo: 1}
```
上面代码中，键值obj是正常引用。所以，即使在 WeakMap 外部消除了obj的引用，WeakMap 内部的引用依然存在。

### 4.1 WeakMap 的用途
```javascript
let myElement = document.getElementById('logo');
let myWeakmap = new WeakMap();

myWeakmap.set(myElement, {timesClicked: 0});

myElement.addEventListener('click', function() {
  let logoData = myWeakmap.get(myElement);
  logoData.timesClicked++;
}, false);
```
