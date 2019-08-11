# async函数

## 1.含义
async 函数是 Generator 函数的语法糖。

async函数对 Generator 函数的改进，体现在以下四点
1. 内置执行器：Generator 函数，需要调用next方法，或者用co模块，才能真正执行，得到最后结果。async 函数不需要
2. 更好的语义
3. 更广的适用性：sync函数的await命令后面，可以是 Promise 对象和原始类型的值（数值、字符串和布尔值，但这时会自动转成立即 resolved 的 Promise 对象）
4. 返回值是 Promise

## 2.基本用法
```javascript
async function getStockPriceByName(name) {
  const symbol = await getStockSymbol(name);
  const stockPrice = await getStockPrice(symbol);
  return stockPrice;
}

getStockPriceByName('goog').then(function (result) {
  console.log(result);
});
```
## 3.语法
### 3.1 返回 Promise 对象
1. async函数返回一个 Promise 对象
2. async函数内部return语句返回的值，会成为then方法回调函数的参数。
```javascript
// 案例一
async function f() {
  return 'hello world';
}

f().then(v => console.log(v))
// "hello world"

// 案例二
async function f() {
  throw new Error('出错了');
}

f().then(
  v => console.log(v),
  e => console.log(e)
)
// Error: 出错了
```
### 3.2 Promise 对象的状态变化
只有async函数内部的异步操作执行完，才会执行then方法指定的回调函数

### 3.3 await 命令
1. 不是Promise对象，直接返回
2. thenable对象，执行then方法
3. Promise.reject('出错了')，会被catch捕获
```javascript
class Sleep {
  constructor(timeout) {
    this.timeout = timeout;
  }
  then(resolve, reject) {
    const startTime = Date.now();
    setTimeout(
      () => resolve(Date.now() - startTime),
      this.timeout
    );
  }
}

(async () => {
  const sleepTime = await new Sleep(1000);
  console.log(sleepTime);
})();
// 1000
```
```javascript
async function f() {
  await Promise.reject('出错了');
  await Promise.resolve('hello world');  // 不会执行
}

f().then(v => console.log(v)).catch(e => console.log(e))
// 出错了
```

### 3.4 错误处理
- try...catch
- catch
```javascript
async function myFunction() {
  try {
    await somethingThatReturnsAPromise();
  } catch (err) {
    console.log(err);
  }
}

// 另一种写法
async function myFunction() {
  await somethingThatReturnsAPromise()
  .catch(function (err) {
    console.log(err);
  });
}
```
### 3.5 注意点
1. 把await命令放在try...catch代码块中
2. 并发不相关的异步操作
3. await命令只能用在async函数之中
4. async 函数可以保留运行堆栈

```javascript
// 2. 并发不相关的异步操作 写法一
let [foo, bar] = await Promise.all([getFoo(), getBar()]);

// 2. 并发不相关的异步操作 写法二
let fooPromise = getFoo();
let barPromise = getBar();
let foo = await fooPromise;
let bar = await barPromise;

// 4. async 函数可以保留运行堆栈
const a = () => {
  b().then(() => c());
};
// 函数a内部运行了一个异步任务b()。
// 当b()运行的时候，函数a()不会中断，而是继续执行。
// 等到b()运行结束，可能a()早就运行结束了，b()所在的上下文环境已经消失了。如果b()或c()报错，错误堆栈将不包括a()

const a = async () => {
  await b();
  c();
};
// b()运行的时候，a()是暂停执行，上下文环境都保存着。一旦b()或c()报错，错误堆栈将包括a()。
```

### 4.async 函数的实现原理
async 函数的实现原理，就是将 Generator 函数和自动执行器，包装在一个函数里。
```javascript
var readFile = function (fileName){
  return new Promise(function (resolve, reject){
    setTimeout(() => {
      resolve(fileName);
    }, 1000)
  });
};
function fn(args){
	return spawn(function* (){
    var f1 = yield readFile('/etc/fstab');
    console.log('f1');
    var f2 = yield readFile('/etc/shells');
    console.log('f2');
  })
}
function spawn(genF){
	return new Promise((resolve, reject) => {
		var gen = genF()
		
		function step(nextF){
			var next
			try{
				next = nextF()
			} catch (e) {
				return reject(e)
			}
			if(next.done) return resolve(next.value)
			Promise.resolve(next.value).then(
			  v => step(() => gen.next(v)), 
			  e => step(() => gen.throw(e))
      )
		}
		step(() => gen.next(undefined))
	})
}
fn(1).then(data => console.log(data))
```

## 5.与其他异步处理方法的比较
- promise：改进回调，但是语义不清晰，包含许多Promise API
- Generator：语义清晰，但需要写自执行函数
- async：语义清晰，不需要写自执行函数

假定某个 DOM 元素上面，部署了一系列的动画，前一个动画结束，才能开始后一个。如果当中有一个动画出错，就不再往下执行，返回上一个成功执行的动画的返回值。
```javascript
// promise
function chainAnimationsPromise(elem, animations) {
  // 变量ret用来保存上一个动画的返回值
  let ret = null;

  // 新建一个空的Promise
  let p = Promise.resolve();

  // 使用then方法，添加所有动画
  for(let anim of animations) {
    p = p.then(function(val) {
      ret = val;
      return anim(elem);
    });
  }

  // 返回一个部署了错误捕捉机制的Promise
  return p.catch(function(e) {
    /* 忽略错误，继续执行 */
  }).then(function() {
    return ret;
  });
}

// Generator
function chainAnimationsGenerator(elem, animations) {
  return spawn(function*() {
    let ret = null;
    try {
      for(let anim of animations) {
        ret = yield anim(elem);
      }
    } catch(e) {
      /* 忽略错误，继续执行 */
    }
    return ret;
  });
}

// async
async function chainAnimationsAsync(elem, animations) {
  let ret = null;
  try {
    for(let anim of animations) {
      ret = await anim(elem);
    }
  } catch(e) {
    /* 忽略错误，继续执行 */
  }
  return ret;
}
```

## 6.实例：按顺序完成异步操作
```javascript
async function logInOrder(urls) {
  // 并发读取远程URL
  const textPromises = urls.map(async url => {
    const response = await fetch(url);
    return response.text();
  });

  // 按次序输出
  for (const textPromise of textPromises) {
    console.log(await textPromise);
  }
}
```

## 7. 顶层 await
新语法提案：允许在模块的顶层独立使用await命令，借用await解决模块异步加载的问题
```javascript
// x.js：等待异步执行完，才继续
console.log("X1");
await new Promise(r => setTimeout(r, 1000));
console.log("X2");

// y.js
console.log("Y");

// z.js
import "./x.js";
import "./y.js";
console.log("Z");
// X1
// Y
// X2
// Z
```
