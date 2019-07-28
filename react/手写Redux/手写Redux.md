## 1.Redux的设计原则
1. 单一数据源
2. 状态是只读的
3. 使用纯函数编写reducer

### 1.1 单一数据源
整个项目只有全局一个state，把它叫做store。即store = state1 + state2 + ...

### 1.2 状态是只读的
不能直接修改store，只能通过dispatch去修改。作用是数据流动方向是单向的，并且行为可追溯。

### 1.3 使用纯函数编写reducer
纯函数：没有副作用的函数
1. 相同的输入必定有相同的输出（例如函数内部没有Math.random,Date.now）
2. 没有接口请求或者i/o操作
3. 没有修改外部引用

为什么需要纯函数？
1. 设计初衷：Redux的设计参考了Flux的模式，可保存应用的历史状态，实现应用**状态的可预测**。
2. 方便调试：例如新旧状态的改变，假如有接口请求等不可测入侵，将变得难以调试。
3. 性能更优：比较新旧状态时，假如不使用纯函数，新旧状态需深比较。而纯函数每次都返回新状态，只需浅比较即可

## 2.Redux 工作流程
1. 创建store，即：createStore()
2. 订阅store，即：store.subscribe()
3. 如何修改store，可将多个reducer合并为一个reducer，即：combineReducers()
4. 应用中间件处理日志、异步等，即applyMiddleware()
5. 根据需求修改store，即：store.dispatch
![Redux流程](http://www.ruanyifeng.com/blogimg/asset/2016/bg2016091802.jpg)
## 3.中间件
Redux只支持同步数据流，可用中间件方式来描述异步的action。（中间件依然没有改变Redux同步数据流）。
![中间件](https://pic3.zhimg.com/80/9c456d5d211602e9d742262c2bf45762_hd.png)
每一个 middleware 处理一个相对独立的业务需求，通过串联不同的 middleware
![中间件](https://pic3.zhimg.com/80/v2-e5b8f433fec45c09260759fb12e90bb6_hd.png)
## 手写Redux
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <div id="num1"></div>
  <div id="num2"></div>
  <button id="add">add</button>
  <button id="sub">sub</button>
</body>
<!--<script src="./redux.js"></script>-->
<script src="./my-redux.js"></script>
<script>
  var redux = window.redux
  var num1 = document.querySelector('#num1')
  var num2 = document.querySelector('#num2')
  var add = document.querySelector('#add')
  var sub = document.querySelector('#sub')

  const reducer1 = (state = 0, action) => {
    switch (action.type) {
      case 'INCREMENT': return state + 1;
      default: return state;
    }
  };
  const reducer2 = (state = 0, action) => {
    switch (action.type) {
      case 'DECREMENT': return state - 1;
      default: return state;
    }
  };
  const combineReducers = redux.combineReducers

  const reducer = combineReducers({ reducer1, reducer2})

  function log({getState, dispatch}) {
    return (next) => (action) => {
      console.log('log before', action, dispatch)
      let returnValue = next(action)
      console.log('log after')

      return returnValue
    }
  }

  function thunk({getState, dispatch}) {
    return (next) => (action) => {
      console.log('thunk before', action)
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }

      return next(action)
    }
  }

  const applyMiddleware = redux.applyMiddleware
  const store = redux.createStore(reducer, {reducer1: 1, reducer2: 2}, applyMiddleware(log, thunk));

  const render = () => {
    const state = store.getState()
    num1.innerHTML = state.reducer1
    num2.innerHTML = state.reducer2
  };

  add.addEventListener('click', function () {
    store.dispatch({type: 'INCREMENT'})
  })
  sub.addEventListener('click', function () {
    store.dispatch((dispatch, getState) => {
      setTimeout(() => {
        dispatch({type: 'DECREMENT'})
      }, 1000)
    })
  })

  render();
  store.subscribe(render);
</script>
</html>
```
```javascript
(function (w) {
  function createStore(reducer, preloadedState, enhancer) {
    // 处理中间件
    if (enhancer) return enhancer(createStore)(reducer, preloadedState)

    var currentReducer = reducer
    var currentState = preloadedState
    var currentListeners = []

    // 根据action和reducer修改state
    function dispatch(action) {
      currentState = currentReducer(currentState, action)
      // state更新时触发订阅
      currentListeners.forEach(sub => sub())
      return action
    }

    // 订阅 state
    function subscribe(listener) {
      currentListeners.push(listener)
      // 退订 state
      return function unsubscribe() {
        var index = currentListeners.indexOf(listener)
        currentListeners.splice(index, 1)
      }
    }

    // 获取 state
    function getState() {
      return currentState
    }

    // 替换 reducer
    function replaceReducer(nextReducer) {
      currentReducer = nextReducer
      dispatch({ type: 'replace' })
    }

    // 根据 reducer 初始化 state
    dispatch({ type: 'init' })

    return {
      dispatch: dispatch,
      subscribe: subscribe,
      getState: getState,
      replaceReducer: replaceReducer
    }
  }

  // 组合reducer数组
  function combineReducers(reducers) {
    var reducerKeys = Object.keys(reducers)

    return function combination(state, action) {
      var nextState = {}

      for (var i = 0; i < reducerKeys.length; i++) {
        var key = reducerKeys[i]
        var reducer = reducers[key]
        var preState = state[key]

        nextState[key] = reducer(preState, action)
      }

      return nextState
    }
  }
  // 链式调用
  function compose(...funcs) {
    if (funcs.length === 0) arg => arg
    if (funcs.length === 1) funcs[0]
    return funcs.reduce((a, b) => (...args) => a(b(...args)))
  }
  // 处理中间件
  function applyMiddleware(...middlewares) {
    // 只修改 dispatch 方法
    return createStore => (...args) => {
      const store = createStore(...args)
      // 声明 dispatch，接下来此函数将替代store.dispatch
      let dispatch = () => {}

      const middlewareAPI = {
        getState: store.getState,
        dispatch: (...args) => dispatch(...args)
      }

      // middlewareAPI.dispatch 是对 dispatch 的引用，作用是中间件所调用的dispatch就是修改过的dispatch
      const chain = middlewares.map(middleware => middleware(middlewareAPI))

      // 修改 dispatch 为链式调用，例如：dispatch = middleware1(middleware2(store.dispatch))
      dispatch = compose(...chain)(store.dispatch)

      return {
        ...store,
        dispatch
      }
    }
  }
  w.redux = {
    createStore,
    combineReducers,
    compose,
    applyMiddleware
  }
})(window)
```

## 4. 参考
[Redux 中文文档](https://www.redux.org.cn/)
[redux middleware 详解](https://zhuanlan.zhihu.com/p/20597452)
[redux真的不复杂——源码解读](https://juejin.im/post/5b9617835188255c781c9e2f#heading-0)
