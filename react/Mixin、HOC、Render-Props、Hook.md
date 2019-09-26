# Mixin、HOC、Render-Props、Hook
主要为了代码复用
- Mixin
  - 缺陷
    - 隐式依赖
    - 命名冲突
    - 结构模糊
- HOC：属性代理（代理爸爸）、反向继承（代理孩子）
  - 优势
    - 低耦合度：通过props影响状态，而不直接修改state
    - 低复杂度：层级结构
  - 缺陷
    - Ref传递问题：可用React.forwardRef解决
    - 嵌套地狱：多层嵌套
    - 命名冲突
    - 黑盒
- render-props
  - 优势
    - ref：可用
    - 嵌套地狱：没有，因为不必包裹其他组件
    - 命名冲突：没有，因为不必包裹其他组件
    - 黑盒：没有
  - 缺陷
    - 回调地狱
    - 结构模糊
- hook 
  - 优势
    - 简洁：没有嵌套地狱和回调地狱问题
    - 解耦：UI和状态分离
    - 组合：Hooks 中可以引用另外的 Hooks形成新的Hooks
    - 函数友好：解决了类组件的几大问题
      - this指向
      - 以生命周期分割代码，难以维护和理解
      - 代码复用成本高
  - 缺点
    - 学习成本高
    - 写法限制：不能出现在条件、循环中
    - 破坏了PureComponent、React.memo浅比较的性能优化效果
    - 在闭包场景可能会引用到旧的state、props值
    - 内部实现上不直观（依赖一份可变的全局状态，不再那么“纯”）
    - React.memo并不能完全替代shouldComponentUpdate（因为拿不到 state change，只针对 props change）
      
## 1.Mixin
在不修改原来的前提下，增强其功能。与继承的区别：拷贝任意多个对象的任意个方法到一个新对象上去
```javascript
function mixin(sourceObj, targetObj){
  for(let key in sourceObj){
    if(!(key in targetObj)){
      targetObj[key] = sourceObj[key];
    }
  }
  return targetObj;
}

let Vehicle = {
  engines: 1,
  ignition () {
    console.log("Turning on my engine.");
  },
  drive () {
    this.ignition();
    console.log("Steering and moving forward!");
  }
};

let Car = mixin(Vehicle, {
  wheels: 4,
  drive () {
    Vehicle.drive.call(this);
    console.log(`Rolling on all ${this.wheels} wheels`);
  }
})

Car.drive();
```

## 2.React中的Mixin
```typescript jsx
var LogMixin = {
  log: function() {
    console.log('log');
  },
  componentDidMount: function() {
    console.log('in');
  },
  componentWillUnmount: function() {
    console.log('out');
  }
};

var User = React.createClass({
  mixins: [LogMixin],
  render: function() {
    return (<div>...</div>)
  }
});

var Goods = React.createClass({
  mixins: [LogMixin],
  render: function() {
    return (<div>...</div>)
  }
});
```

危害：
- ES6 class 不支持 mixin
- 可能会相互依赖：不利于代码维护
- 可能会命名冲突：不同Mixin的方法可能会相互冲突
- 不够直接：minxins 改变了 state，因此也就很难知道一些 state 是从哪里来的，尤其是当不止存在一个 mixins 时
- 可能要处理兼容：Mixin非常多时，组件是可以感知到的，甚至还要为其做相关处理，这样会给代码造成滚雪球式的复杂性
- 静态组合

## 3.高阶组件（HOC）
对比原生组件增强的项：
- 操作props
- 操作state
- 获取ref
- 操作渲染
- 操作静态方法
- 操作生命周期

应用场景：
- 权限控制：通过是否符合条件来操作渲染（属性代理）
- 性能监控：记录用户行为、性能指标（反向继承）

注意事项：
- 不要改变原始组件
- 透传不相关的props：与高阶组件不相关的props全部传递给子组件
- displayName：方便调试，显示组件名字
- 静态属性拷贝
- 传递refs（React.forwardRef）
- 不要在render方法内创建高阶组件（因为高阶组件每次都返回新的组件，导致子树每次渲染都会进行卸载，和重新挂载的操作！）

解决Mixin问题：
- ES6 class支持

缺陷：
- 多层嵌套：让调试变得非常困难
- 不够直接：在 mixin 中，我们不知道 state 从何而来；在 HOC 中，我们不知道 props 从何而来。
- 名字冲突：两个使用了同名 prop 的 HOC 将遭遇冲突并且彼此覆盖
- 静态组合

### 3.1 属性代理
```typescript jsx
function withAdminAuth(WrappedComponent) {
    return class extends React.Component {
        constructor(props){
          super(props)
          this.state = {
              isAdmin: false,
          }
        } 
        async componentWillMount() {
            const currentRole = await getCurrentUserRole();
            this.setState({
                isAdmin: currentRole === 'Admin',
            });
        }
        render() {
            if (this.state.isAdmin) {
                return <Comp {...this.props} />;
            } else {
                return (<div>您没有权限查看该页面，请联系管理员！</div>);
            }
        }
    };
}
```

### 3.2 反向继承
```typescript jsx
function withTiming(Comp) {
    return class extends Comp {
        constructor(props) {
            super(props);
            this.start = Date.now();
            this.end = 0;
        }
        componentDidMount() {
            super.componentDidMount && super.componentDidMount();
            this.end = Date.now();
            console.log(`${WrappedComponent.name} 组件渲染时间为 ${this.end - this.start} ms`);
        }
        render() {
            return super.render();
        }
    };
}

```
render函数内实际上是调用React.creatElement产生的React元素，所有属性都是不可修改的。所以只能通过React.cloneElement的方法增强组件

## Render Props
render prop 是一个类型为函数的 prop，它让组件知道该渲染什么

解决：
- ES6 class：支持
- 不够直接：通过 render prop 的参数列表看到有哪些 state 或者 props 可供使用
- 名字冲突：不必包裹其他组件，没有冲突
- 动态组合：根据传入的props来渲染

问题：
- 容易形成回调地狱
- 组织结构不清晰

实时显示鼠标位置
```typescript jsx
// 正常
import React from 'react'
const App = React.createClass({
  getInitialState() {
    return { x: 0, y: 0 }
  },
  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY
    })
  },
  render() {
    const { x, y } = this.state
    return (
      <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>
        <h1>The mouse position is ({x}, {y})</h1>
      </div>
    )
  }
})
```
```typescript jsx
// Mixin
import React from 'react'
const MouseMixin = {
  getInitialState() {
    return { x: 0, y: 0 }
  },
  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY
    })
  }
}
const Mouse = React.createClass({
  // 使用 mixin！
  mixins: [ MouseMixin ],
  
  render() {
    const { x, y } = this.state
    return (
      <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>
        <h1>The mouse position is ({x}, {y})</h1>
      </div>
    )
  }
})
const App = React.createClass({
  render() {
    return (
      <Mouse />
    )
  }
})
```
```typescript jsx
// HOC
import React from 'react'
const withMouse = (Component) => {
  return class extends React.Component {
    state = { x: 0, y: 0 }
    handleMouseMove = (event) => {
      this.setState({
        x: event.clientX,
        y: event.clientY
      })
    }
    render() {
      return (
        <div style={{ height: '400px', width: '100%', background: 'yellow' }} onMouseMove={this.handleMouseMove}>
          <Component {...this.props} mouse={this.state}/>
        </div>
      )
    }
  }
}
class Mouse extends React.Component {
  render() {
    const {x, y} = this.props.mouse
    return (
      <h1>The mouse position is ({x}, {y})</h1>
    )
  }
}
const AppWithMouse = withMouse(Mouse)

class App extends React.Component {
  render() {
    return (
      <AppWithMouse />
    )
  }
}
```
```typescript jsx
import React from 'react'
class Mouse extends React.Component {
  state = { x: 0, y: 0 }
  handleMouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY
    })
  }
  render() {
    return (
      <div style={{ height: '400px', width: '100%', background: 'yellow' }} onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    )
  }
}
class App extends React.Component {
  render() {
    return (
      <Mouse render={({ x, y }) => (
        <h1>The mouse position is ({x}, {y})</h1>
      )}/>
    )
  }
}
```
```typescript jsx
// Hook
import React, { useState, useEffect, useRef } from 'react'

function Mouse() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  function handleMouseMove(event){
    setPosition({
      x: event.clientX,
      y: event.clientY
    })
  }
  return (
    <div style={{ height: '400px', width: '100%', background: 'yellow' }} onMouseMove={handleMouseMove}>
      <h1>Hook ({position.x}, {position.y})</h1>
    </div>
  )
}

class App extends React.Component {
  render() {
    return (
      <Mouse />
    )
  }
}
```

## Hook
Hook可以让你在class以外使用state和其他React特性
- useState
- useEffect(回调函数, 状态依赖)：
  - 回调函数：渲染完后调用（返回函数表示执行下一次useEffect之前，会调用这个函数）
  - 状态依赖：当配置了状态依赖项后，只有检测到配置的状态变化时，才会调用回调函数
- useContext：共享状态
- useReducer：使用 Reducer 函数算出新的状态
- useRef：获取dom || 保存一个任意值

```typescript jsx
function useTest() {
  useEffect(() => {
    console.log('执行...', count);
    return () => {
      console.log('清理...', count);
    }
  }, [count]);
}

function HookTest() {
  const inputEl = useRef(null);
  const [count, setCount] = useState(0);
  // 提取复用
  useTest()
  return (
    <div>
      <input ref={inputEl} type="text" />
      <p>You clicked {count} times</p>
      <button onClick={() => { setCount(count + 1); setNumber(number + 1); }}>
        Click me
      </button>
    </div>
  );
}

// 结果
// 页面渲染...1
// 执行... 1
// 页面渲染...2
// 清理... 1
// 执行... 2
// 页面渲染...3
// 清理... 2
// 执行... 3
// 页面渲染...4
// 清理... 3
// 执行... 4
```

注意：
- 只能在React函数式组件或自定义Hook中使用Hook
- 不要在循环，条件或嵌套函数中调用Hook：因为Hook通过数组实现，每次useState 都会改变下标，导致错误[链接](https://react.docschina.org/docs/hooks-rules.html)

使用Hook的动机：
- 减少状态逻辑复用的风险
- 避免地狱式嵌套
- 让组件更容易理解
- 使用函数代替class

## 参考
[Mixin、多重继承与装饰者模式](https://github.com/youngwind/blog/issues/97)  
[【React深入】从Mixin到HOC再到Hook](https://juejin.im/post/5cad39b3f265da03502b1c0a#heading-1)
