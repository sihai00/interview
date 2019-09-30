# 第5章：代码组合（compose）

## compose
不在乎如何分组。组合符合交换律

```javascript
var compose = function(f,g) {
  return function(x) {
    return f(g(x));
  };
};

var toUpperCase = function(x) { return x.toUpperCase(); };
var exclaim = function(x) { return x + '!'; };
var shout1 = compose(exclaim, toUpperCase);
var shout2 = compose(exclaim, toUpperCase);

shout1("send in the clowns");
//=> "SEND IN THE CLOWNS!"

shout2("send in the clowns");
//=> "SEND IN THE CLOWNS!"
```

## pointfree
pointfree：不在乎数据结构

```javascript
var toUpperCase = function(str) { return str.toUpperCase(); };
var replace = function(reg, rep){
	return function(str){
		return str.replace(reg, rep)
	}
}
var compose = function(f,g) {
  return function(x) {
    return f(g(x));
  };
};

var snakeCase = compose(replace(/\s+/ig, '_'), toUpperCase);
snakeCase(' ABc ')
```

## debug
当遇到错误，追踪代码的执行情况

```javascript
var toUpperCase = function(str) { return str.toUpperCase(); };
var replace = function(reg, rep){
	return function(str){
		return str.replace(reg, rep)
	}
}
var compose = function(f,g) {
  return function(x) {
    return f(g(x));
  };
};
var debug = function(tag, x){
  console.log(tag, x);
  return x;
}
// curry
var trace = function(tag) {
  return function(x) {
    return debug(tag, x)
  }
}

var snakeCase = compose(replace(/\s+/ig, '_'), compose(trace('---'), toUpperCase));
snakeCase(' ABc ')
// ---  ABC 
// _ABC_
```
