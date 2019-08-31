# 装饰者模式与AOP

## 装饰者模式
在不改变对象的情况下添加功能

```javascript
var plane = {
  fire: function(){
    console.log( '发射普通子弹' ); 
  }
}
var missileDecorator = function(){ 
  console.log( '发射导弹' );
}
var atomDecorator = function(){ 
  console.log( '发射原子弹' );
}
var fire1 = plane.fire;
plane.fire = function(){ 
  fire1();
  missileDecorator(); 
}
var fire2 = plane.fire;
plane.fire = function(){ 
  fire2();
  atomDecorator(); 
}
plane.fire();
// 分别输出: 发射普通子弹、发射导弹、发射原子弹
```

## AOP
面向切面编程（AOP）：是对 OOP 的补充，在各个节点前后插入动作。

与装饰者模式区别：
装饰者模式是一种设计模式，而AOP是一种编程范式，可以看作是装饰者模式的实现。

与OOP区别：
- OOP：针对业务处理过程的实体及其属性和行为进行抽象封装
- AOP：针对业务处理过程中的某个步骤或阶段进行提取

例如：雇员抽象为Employee类（OOP），雇员上班（是一个AOP节点，上班前坐车和下班后吃饭是AOP的提取工作）

## ES3下装饰者的实现
```javascript
// 原函数
var takePhoto = function(){
  console.log('拍照片');
}

Function.prototype.before = function(beforefn){
  let _self = this;
  return function(){
    beforefn.apply(this, arguments);
    return _self.apply(this, arguments);
  }
}

Function.prototype.after = function(afterfn){
  let _self = this;
  return function(){
    let ret = _self.apply(this, arguments);
    afterfn.apply(this, arguments);
    return ret;
  }
}

// 用装饰函数装饰原函数
takePhoto = takePhoto.before(() => {
  console.log('加滤镜')
}).after(() => {
  console.log('加滤镜')
})

takePhoto()
```

## ES5下装饰者的实现
```javascript
let takePhoto = function () {
  console.log('拍照片');
}
// 给 takePhoto 添加属性 after
Object.defineProperty(takePhoto, 'after', {
  writable: true,
  value: function () {
    console.log('加滤镜');
  },
});
// 给 takePhoto 添加属性 before
Object.defineProperty(takePhoto, 'before', {
  writable: true,
  value: function () {
    console.log('打开相机');
  },
});
// 包装方法
let aop = function (fn) {
  return function () {
    fn.before()
    fn()
    fn.after()
  }
}

takePhoto = aop(takePhoto)
takePhoto()
```
## 基于原型链和类的装饰者实现
```javascript
class Test {
  takePhoto() {
    console.log('拍照');
  }
}

function around(target, action, fn) {
  let old = target.prototype[action];
  if (old) {
    target.prototype[action] = function () {
      let self = this;
      let handle = () => {
          return old.apply(self, arguments || args);
      }
      fn.bind(self);
      fn(handle);
    }
  }
}

around(Test, 'takePhoto', (handle) => {
  console.log('准备拍照');
  let res = handle();
  console.log('拍照完成');
  return res;
});

let t = new Test();
t.takePhoto();
```

## ES7修饰器实现装饰者
```javascript
function after(target, key, desc) {
  const { value } = desc;
  desc.value = function (...args) {
    let res = value.apply(this, args);
    console.log('加滤镜')
    return res;
  }
  return desc;
}

class Test{
  @after
  takePhoto(){
    console.log('拍照')
  }
}

let t = new Test()
t.takePhoto()
```

## 应用
- 性能上报：记录某异步请求请求耗时的性能数据并上报
- 异常处理：可以对原有代码进行简单的异常处理

## 参考
[5 分钟即可掌握的 JavaScript 装饰者模式与 AOP](https://juejin.im/post/5d0f5dd551882532d72507f2#heading-0)
