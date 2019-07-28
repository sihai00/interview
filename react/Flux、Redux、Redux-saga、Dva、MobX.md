## 1.Flux
Flux 是一种架构思想，专门解决软件的结构问题（类似MVC）。
- 数据单向流动
- 只能通过Action改变Store（所以可以做数据记录）

### 1.1 流程
- View： 视图层
- Action（动作）：视图层发出的消息（比如mouseClick）
- Dispatcher（派发器）：用来接收Actions、执行回调函数
- Store（数据层）：用来存放应用的状态，一旦发生变动，就提醒Views要更新页面

![Flux](http://www.ruanyifeng.com/blogimg/asset/2016/bg2016011503.png)
1. 用户访问 View
2. View 发出用户的 Action
3. Dispatcher 收到 Action，要求 Store 进行相应的更新
4. Store 更新后，发出一个"change"事件
5. View 收到"change"事件后，更新页面

### 1.2 缺点
![Flux](https://raw.githubusercontent.com/wangning0/Autumn_Ning_Blog/master/blogs/2016-1-3/flux/pt/flux_c.png)

1. 一个页面可能有多个Store
2. Store封装了数据还有处理数据的逻辑（例如需要获取Store、监听Store变化、触发Store更新等等）
3. State可以随意修改（单个Store里面保存数据的是State）

## 2.Redux
三大原则：
- 单一数据源：Flux 的数据源可以是多个。 
- State 是只读的：Flux 的 State 可以随便改。 
- 使用纯函数来执行修改：Flux 执行修改的不一定是纯函数。

### 2.1 流程
![Redux](http://www.ruanyifeng.com/blogimg/asset/2016/bg2016091802.jpg)
1. 用户发出 Action
2. Store 自动调用 Reducer，并且传入两个参数：当前 State 和收到的 Action。 
3. Reducer 返回新的 State 。
3. State 一旦有变化，Store 就会调用监听函数。（视图层此时可以通过监听函数获取到最新的数据）

### 2.2 Redux
```javascript
const Counter = ({ value, onIncrement, onDecrement }) => (
  <div>
    <h1>{value}</h1>
    <button onClick={onIncrement}>+</button>
    <button onClick={onDecrement}>-</button>
  </div>
);

const reducer = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT': return state + 1;
    case 'DECREMENT': return state - 1;
    default: return state;
  }
};

const store = createStore(reducer);

const render = () => {
  ReactDOM.render(
    <Counter
      value={store.getState()}
      onIncrement={() => store.dispatch({type: 'INCREMENT'})}
      onDecrement={() => store.dispatch({type: 'DECREMENT'})}
    />,
    document.getElementById('root')
  );
};

render();
store.subscribe(render);
```

### 2.3 React-Redux
React-Redux 可以方便处理 Redux 和 React UI 的绑定
```javascript
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'

class Counter extends Component {
  render() {
    const { value, onIncreaseClick } = this.props
    return (
      <div>
        <span>{value}</span>
        <button onClick={onIncreaseClick}>Increase</button>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    value: state.count
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onIncreaseClick: () => dispatch(increaseAction)
  }
}

const App = connect(mapStateToProps, mapDispatchToProps)(Counter)

// Action
const increaseAction = { type: 'increase' }

// Reducer
function counter(state = { count: 0 }, action) {
  const count = state.count
  switch (action.type) {
    case 'increase':
      return { count: count + 1 }
    default:
      return state
  }
}

// Store
const store = createStore(counter)

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

### 2.4 处理异步
使用Redux中间件。store.dispatch一般只支持对象，中间件对store.dispatch方法进行了改造，在发出 Action 和执行 Reducer 这两步之间，添加了其他功能。

#### 2.4.1 redux-thunk代码
使store.dispatch可以处理函数
```javascript
const fetchPosts = postTitle => (dispatch, getState) => {
  return fetch(id).then(response => {
    dispatch({
      type: FETCH_DATA_SUCCESS,
      payload: response
    })
  }).catch(error => {
    dispatch({
      type: FETCH_DATA_FAILED,
      payload: error
    })
  })
};

// 使用方法一
store.dispatch(fetchPosts('reactjs'));
// 使用方法二
store.dispatch(fetchPosts('reactjs')).then(() =>
  console.log(store.getState())
);

//reducer
const reducer = function(oldState, action) {
    switch(action.type) {
    case FETCH_DATA_SUCCESS : 
        // 更新 store 等
    case FETCH_DATA_FAILED : 
        // 提示异常
    }
}
```
#### 2.4.2 redux-promise代码
使store.dispatch可以处理Promise。redus-promise 和 redux-thunk 的思想类似，只不过做了一些简化，成功失败手动 dispatch 被封装成自动了
```javascript
const FETCH_DATA = 'FETCH_DATA'
//action creator
const getData = function (id) {
  return {
    type: FETCH_DATA,
    payload: api.fetchData(id) // 直接将 promise 作为 payload
  }
}

store.dispatch(fetchPosts('reactjs'));

//reducer
const reducer = function (oldState, action) {
  switch (action.type) {
    case FETCH_DATA:
      if (action.status === 'success') {
        // 更新 store 等处理
      } else {
        // 提示异常
      }
  }
}
```
#### 2.4.3 redux-saga
使用Generator语法来处理状态。
1. store.dispatch的参数是还是对象
2. 代码隔离：异步数据获取的相关业务逻辑放在了单独的 saga.js 中
3. 代码已读：saga 代码采用类似同步的方式书写
```javascript
import { call, put } from 'redux-saga/effects'
import { takeEvery } from 'redux-saga'

export function* fetchData(action) {
   try {
      const data = yield call(Api.fetchUser, action.payload.url);
      yield put({type: "FETCH_SUCCEEDED", data});
   } catch (error) {
      yield put({type: "FETCH_FAILED", error});
   }
}

function* watchFetchData() {
  yield* takeEvery('FETCH_REQUESTED', fetchData)
}
```
## 3.Dva
把redux、react-redux、redux-saga、react-router整合到一起轻量级的应用框架。
![Dva](https://cdn.yuque.com/yuque/0/2018/png/103904/1528436195004-cd3800f2-f13d-40ba-bb1f-4efba99cfe0d.png)

### Dva代码
```javascript
app.model({
  // namespace - 对应 reducer 在 combine 到 rootReducer 时的 key 值
  namespace: 'products',
  // state - 对应 reducer 的 initialState
  state: {
    list: [],
    loading: false,
  },
  // subscription - 在 dom ready 后执行
  subscriptions: [
    function(dispatch) {
      dispatch({type: 'products/query'});
    },
  ],
  // effects - 对应 saga，并简化了使用
  effects: {
    ['products/query']: function*() {
      yield call(delay(800));
      yield put({
        type: 'products/query/success',
        payload: ['ant-tool', 'roof'],
      });
    },
  },
  // reducers - 就是传统的 reducers
  reducers: {
    ['products/query'](state) {
      return { ...state, loading: true, };
    },
    ['products/query/success'](state, { payload }) {
      return { ...state, loading: false, list: payload };
    },
  },
});
```

## 4.Mobx
Mobx它把 state 包装成可观察的对象，只要一变，其他用到的地方就都跟着自动变。

## 4.1 Mobx代码
```javascript
import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { Provider, observer, inject } from 'mobx-react';

// 定义数据结构
class Store {
  // ① 使用 observable decorator 
  @observable a = 0;
}

// 定义对数据的操作
class Actions {
  constructor({store}) {
    this.store = store;
  }
  // ② 使用 action decorator 
  @action
  incA = () => {
    this.store.a++;
  }
  @action
  decA = () => {
    this.store.a--;
  }
}

// ③实例化单一数据源
const store = new Store();
// ④实例化 actions，并且和 store 进行关联
const actions = new Actions({store});

// inject 向业务组件注入 store，actions，和 Provider 配合使用
// ⑤ 使用 inject decorator 和 observer decorator
@inject('store', 'actions')
@observer
class Demo extends Component {
  render() {
    const { store, actions } = this.props;
    return (
      <div>
        <p>a = {store.a}</p>
        <p>
          <button className="ui-btn" onClick={actions.incA}>增加 a</button>
          <button className="ui-btn" onClick={actions.decA}>减少 a</button>
        </p>
      </div>
    );
  }
}

class App extends Component {
  render() {
    // ⑥使用Provider 在被 inject 的子组件里，可以通过 props.store props.actions 访问
    return (
      <Provider store={store} actions={actions}>
        <Demo />
      </Provider>
    )
  }
}

export default App;
```

### 4.2 缺点
1. 数据直接修改，导致MobX 没有那么自然的数据流动，也没有时间回溯的能力
2. MobX 会比较灵活，但是大型项目会造成代码很难维护，各有利弊

## 参考
[Vuex、Flux、Redux、Redux-saga、Dva、MobX](https://zhuanlan.zhihu.com/p/53599723)
[Flux 架构入门教程 - 阮一峰](http://www.ruanyifeng.com/blog/2016/01/flux.html)
[Redux 入门教程（一）：基本用法 - 阮一峰](http://www.ruanyifeng.com/blog/2016/09/redux_tutorial_part_one_basic_usages.html)
[Redux 入门教程（二）：中间件与异步操作 - 阮一峰](http://www.ruanyifeng.com/blog/2016/09/redux_tutorial_part_two_async_operations.html)
[Redux 入门教程（三）：React-Redux 的用法 - 阮一峰](http://www.ruanyifeng.com/blog/2016/09/redux_tutorial_part_three_react-redux.html)
