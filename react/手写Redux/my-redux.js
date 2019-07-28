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
