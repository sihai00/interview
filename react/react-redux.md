# react-redux
react-redux 是 redux 官方 React 绑定库。它帮助我们连接UI层和数据层

- Provider：接受store挂载到context上，使子孙可以获取
- Connect：连接store和组件
    - 获取store：state保存所需要的store数据
    - 改变store：dispatch修改store
    - 监听store改变：当store改变时，setState配合this.props更改当前组件的state
    - 卸载时移除监听

## 1.Provider
### 1.1 使用
```typescript jsx
import React, { Component } from 'react';
import { Provider } from '../react-redux';
import store from './store';
import Counter from './Counter';

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
         <Counter />
      </Provider>
    )
  }
}
```

### 1.2 原理
```typescript jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Provider extends Component {
  static childContextTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    }).isRequired
  }
  constructor(props) {
    super(props);
    this.store = props.store;
  }
  getChildContext() {
    return {
      store: this.store
    }
  }
  render() {
    return this.props.children
  }
}
```

## 2.Connect
- mapStateToProps：组件需要绑定的store状态
- mapDispatchToProps：组件需要绑定的修改store的动作
- Component：渲染组件

### 2.1 使用
```typescript jsx
import React, { Component } from 'react';
import { connect } from '../react-redux';
import actions from '../store/actions/counter';

class Counter extends Component {
  render() {
    return (
      <div>
        <p>{`number: ${this.props.number}`}</p>
        <button onClick={() => { this.props.add(2) }}>+</button>
        <button onClick={() => { this.props.minus(2) }}>-</button>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  number: state.counter.number
});

const mapDispatchToProps = (dispatch) => ({
  add: (num) => {
    dispatch(actions.add(num))
  },
  minus: (num) => {
    dispatch(actions.minus(num))
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
```

### 2.2 原理
```typescript jsx
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import storeShape from '../utils/storeShape';
import shallowEqual from '../utils/shallowEqual';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function connect(mapStateToProps, mapDispatchToProps) {
  // 默认
  if(!mapStateToProps) mapStateToProps = state => ({})
  if(!mapDispatchToProps) mapDispatchToProps = dispatch => ({ dispatch })
  
  return function wrapWithConnect (WrappedComponent) {
    return class Connect extends Component {
      static contextTypes = storeShape;
      static displayName = `Connect(${getDisplayName(WrappedComponent)})`;
      constructor(props) {
        super(props);
        this.state = mapStateToProps(store.getState(), this.props);
        if(typeof mapDispatchToProps === 'function') {
          this.mappedDispatch = mapDispatchToProps(store.dispatch, this.props);
        }else{
          this.mappedDispatch = bindActionCreators(mapDispatchToProps, store.dispatch);
        }
      }
      componentDidMount() {
        this.unsub = store.subscribe(() => {
          const mappedState = mapStateToProps(store.getState(), this.props);
          // 浅比较优化
          if(shallowEqual(this.state, mappedState)) return
          this.setState(mappedState)
        });
      }
      componentWillUnmount() {
        this.unsub();
      }
      render() {
        return (
          <WrappedComponent {...this.props} {...this.state} {...this.mappedDispatch} />
        )
      }
    }
  }
}
```

## 参考
- [react-redux](https://github.com/reduxjs/react-redux)
- [【React系列】动手实现一个react-redux](https://juejin.im/post/5d9ca65be51d45782c23fab7#heading-0)
