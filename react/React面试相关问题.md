# React面试相关问题

## React对比原生的优势
- 组件化：使代码更易于维护和组合
- MVVM结构分层：对比耦合严重的面条代码，MVVM模式让代码结构分层，解耦，更利于维护
- 开发效率：MVVM自动随数据自动更新DOM，不再需要手写来更新DOM，提高开发效率
- 生态：生态好且繁荣，有很多解决方案
- 跨平台：React甚至提供跨平台方案

## key的作用
用于追踪哪些列表中元素被修改、被添加或者被移除的辅助标识，减少不必要的渲染

## React中元素与组件的区别
- 元素：React中最小基本单位，表示一个虚拟DOM对象
- 组件：由元素组成，可以是函数、类、React.createElement来创建

## 组件通信
- 父到子：props
- 子到父：父传函数，子以参数来调用父函数
- 兄弟间：父作为中间者来传递
- context
- 发布订阅模式
- Redux

## React.forwardRef
React.createRef是用来获取元素的DOM节点，而当元素是组件的时候，通过这种方法只能获取组件的实例
React.forwardRef可以获取组件的DOM节点
```typescript jsx
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }
  render() {
    return <div ref={this.myRef} />;
  }
}
```
```typescript jsx
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));

// 你可以直接获取 DOM button 的 ref：
const ref = React.createRef();
<FancyButton ref={ref}>Click me!</FancyButton>;
```

## 生命周期以及作用
- 挂载阶段
    - constructor：初始化state和方法绑定
    - getDerivedStateFromProps（静态方法）：返回一个对象来更新 state。用于***state的值在任何时候都取决于 props***
    - render
    - componentDidMount：***用于处理副作用（例如请求、动画）***
- 更新阶段
    - getDerivedStateFromProps（静态方法）：返回一个对象来更新 state。用于***state的值在任何时候都取决于 props***
    - shouldComponentUpdate：判断 React 组件的输出是否受当前 state 或 props 更改的影响。用于***性能优化***，建议使用***PureComponent组件***
        - return true：进行render
        - return false：不进行render
    - render
    - getSnapshotBeforeUpdate：返回值作为componentDidUpdate的参数。它使得组件能在发生更改之前从 DOM 中捕获一些信息（例如，滚动位置）
    - componentDidUpdate：***用于处理副作用（例如请求、动画）***，注意它必须被包裹在一个条件语件里
- 卸载阶段
    - componentWillUnmount：在组件卸载及销毁之前直接调用。用于清理操作，例如，清除 timer，取消网络请求或清除在 componentDidMount() 中创建的订阅等
- 其他：
    - componentDidCatch：在后代组件抛出错误后被调用

## 移除componentWillMount、componentWillReceiveProps、componentWillUpdate的原因
React16分为reconciler阶段与commit阶段。
- reconciler阶段（同步||异步）：为了得到标记了副作用的 Fiber 节点树
    - 更新 state 与 props；
    - 生成 Fiber Tree；
    - 调用生命周期钩子；
    - 构建workInProgress tree，标记副作用用于React更新
    - 确定是否需要重新渲染
- commit阶段（同步）： 更新DOM
    - 如需要，则操作 dom 节点更新；

原因：
- 在reconciler阶段进行一些DOM操作或者setState的话会影响调度时间
- 在reconciler阶段由于是可以被打断的所以可能会导致多次执行，这样也会导致willXXX钩子执行多次，违反它们的语义

## 静态方法：getDerivedStateFromProps(nextProps, preState)
state的值在任何时候都取决于 props，并且跟生命周期有关系才使用。
例如，实现 <Transition> 组件可能很方便，该组件会比较当前组件与下一组件，以决定针对哪些组件进行转场动画。

静态方法：他不属于任何一个实例
原因是：React16更新Fiber后调度阶段会触发多次。不希望用户在此时进行副作用的操作（例如获取DOM获取更新state），导致错误

## getSnapshotBeforeUpdate(preProps, preState)
它使得组件能在发生更改之前从 DOM 中捕获一些信息（例如，滚动位置）。返回值作为componentDidUpdate的第三个参数，来进行操作

## 为什么要在componentDidMount中发请求
1. 在挂载之前，数据其实并不存在。在constructor请求和componentDidMount请求其实是一样的
2. 假如是想让请求更早触发，但是React16不能保证constructor或者componentWillMount的触发次数，因为Fiber可以让React开始或者中断更新
3. 在将来componentWillMount会被废弃

## [Fiber架构](https://zhuanlan.zhihu.com/p/37095662)
当遇到进程阻塞的问题时，任务分割、异步调用 和 缓存策略 是三个显著的解决思路。

1. Fiber架构相对于以前的递归更新组件有有什么优势
- 原因是递归更新组件会让js调用栈占用很长时间
- 因为浏览器是单线程的，GUI渲染线程和js线程是互斥的。当js线程长时间占用时，渲染就会延时，看上去就是卡顿
- Fiber架构将任务分片执行。当浏览器有空闲时，再去执行高优先级的任务，降低渲染阻塞。

2. 既然你说Fiber是将组件分段渲染，那第一段渲染之后，怎么知道下一段从哪个组件开始渲染呢
- fiber节点拥有return, child, sibling三个属性，分别对应父节点，第一个孩子，它右边的兄弟，有了它们就足够将一棵树变成一个链表

3. 怎么决定每次更新的数量
- React16则是需要将虚拟DOM转换为Fiber节点，首先它规定一个时间段内，然后在这个时间段能转换多少个FiberNode，就更新多少个。
- 因此我们需要将我们的更新逻辑分成两个阶段，第一个阶段是将虚拟DOM转换成Fiber, Fiber转换成组件实例或真实DOM（不插入DOM树，插入DOM树会reflow）。Fiber转换成后两者明显会耗时，需要计算还剩下多少时间。
- 比如，可以记录开始更新视图的时间var now = new Date - 0，假如我们更新试图自定义需要100毫秒，那么定义结束时间是var deadline = new Date + 100 ,所以每次更新一部分视图，就去拿当前时间new Date<deadline做判断，如果没有超过deadline就更新视图，超过了，就进入下一个更新阶段

4. 如何调度时间才能保证流畅
- requestAnimationFrame：浏览器重绘之前调用
    - 计算每一帧时间
    - 计算过期时间：当前时间 + 每一帧时间
- MessageChannel：浏览器重绘完后触发，优先级比较高
    - 判断过期时间与当前时间是否过期

使用requestIdleCallback或者模拟。作用是在浏览器空闲时间执行React切片任务。
- 计算任务的过期时间expriationTime（高优先级的任务会打断低优先级任务）。判断任务是否过期
    - 过期：无须调度，直接调用 port.postMessage(undefined)，这样就能在渲染后马上执行过期任务了
    - 没过期：
        - 通过 requestAnimationFrame 启动定时器，通过比较两次帧调用可计算环境执行每一帧的时间。执行port.postMessage(undefined)
        - channel.port1.onmessage 会在渲染后立即被调用。在这个过程中我们首先需要去判断当前时间是否小于下一帧时间。
            - 小于：空余时间去执行任务
            - 大于：当前帧已经没有空闲时间了。是否有任务过期
                - 过期：执行这个任务。
                - 没过期：把这个任务丢到下一帧
                
## setState之后发生什么
- 在 `updateQueue` 链表上记录所需更新的任务`update`：在一定的时间内进行批量更新操作
- 调度阶段（异步）：高优先级任务可打断低优先级任务
    1. 从 `updateQueue` 链表上获取一个`update`（`nextUnitOfWork`）：单个 `fiber` 节点作为最小工作单位
    2. 找到`update`的根`fiber`：自顶向下逐节点构造 `workInProgress tree` 来标记副作用
        1. 当前fiber是否需要更新（`beginWork`）
            - 不需要：直接把子节点`clone`过来
            - 需要：
                - 生成 `fiber`
                - 标记更新类型
                - 更新当前节点状态（`props`、`state`、`context` 等）
                - 调用 `shouldComponentUpdate` 生命周期
                - 调用组件实例方法 `render` 获得新的子节点，并为子节点创建 `Fiber Node`（创建过程会尽量复用现有 `Fiber Node`，子节点增删也发生在这里）
        2. 是否产生 `child fiber`
            - 产生：把 `child fiber` 作为下一个工作单元
            - 没有产生：把 `effect list` 归并到 `return` ，并把当前节点的 `sibling` 作为下一个工作单元（`completeUnitOfWork`）：处理兄弟 `fiber` 和父 `fiber` 副作用
        4. 判断是否有空闲时间（`requestIdleCallback`）
            - 没有时间：把控制权还给浏览器
            - 有时间：进入 `5`
        5. 是否有下一个工作单元
            - 有：回到 `1` 处理下一个工作单元
            - 无：进入提交阶段
- 提交阶段（同步）：
    1. 处理 `effect list` 包括3种处理：
        - 更新DOM树
        - 调用组件生命周期函数
        - 更新ref等内部状态
    2. 交换current和workInProgress两个指针

## 优先级策略
用来动态调整任务调度，是工作循环的辅助机制，最先做最重要的事情。
高优先级的比如键盘输入（希望立即得到反馈），低优先级的比如网络请求，让评论显示出来等等。另外，紧急的事件允许插队

- synchronous：同步执行，首屏（首次渲染）用，要求尽量快，不管会不会阻塞UI线程
- task：在next tick之前执行
- animation（`requestAnimationFrame`调度）：下一帧之前执行
- high（`requestIdleCallback`调度）：在不久的将来立即执行
- low（`requestIdleCallback`调度）：稍微延迟（100-200ms）执行也没关系
- offscreen（`requestIdleCallback`调度）：下一次render时或scroll时才执行

## setState是同步还是异步
- setState 只在合成事件和钩子函数中是“异步”的，在原生事件和setTimeout 中都是同步的。
- setState 的“异步”并不是说内部由异步代码实现，其实本身执行的过程和代码都是同步的，只是合成事件和钩子函数的调用顺序在更新之前，导致在合成事件和钩子函数中没法立马拿到更新后的值，形成了所谓的“异步”，当然可以通过第二个参数 setState(partialState, callback) 中的callback拿到更新后的结果。
- setState 的批量更新优化也是建立在“异步”（合成事件、钩子函数）之上的，在原生事件和setTimeout 中不会批量更新，在“异步”中如果对同一个值进行多次setState，setState的批量更新策略会对其进行覆盖，取最后一次的执行，如果是同时setState多个不同的值，在更新时会对其进行合并批量更新。

## 简述一下virtual DOM 如何工作
- 虚拟DOM本质上是JavaScript对象，是对真实DOM的抽象
- 状态变更时，记录新树和旧树的差异
- 最后把差异更新到真正的dom中

## 事件
```typescript jsx
/**
 * 这个组件有什么问题。为什么？要如何解决呢？
 */

class App extends React.Component {
  state = { search: '' }
  handleChange = event => {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.setState({
        search: event.target.value
      })
    }, 250);
  }
  render() {
    return (
      <div>
        <input type="text" onChange={this.handleChange} />
        {this.state.search ? <p>Search for: {this.state.search}</p> : null}
      </div>
    )
  }
}

// 报错，event.target.value不存在
```
React 中 event 是一个合成事件，并且是以对象池来实现的。
当执行事件代码时，React从对象池复用或者创建合成事件，传入事件中
当执行setTimeout时，由于异步回调函数加入了任务列队。当执行回调函数时，事件已经被React回收了，所以.target.value 引用不会再有效

## 参考
- [React Fiber](https://juejin.im/post/5ab7b3a2f265da2378403e57#heading-0)
- [React Fiber架构](https://zhuanlan.zhihu.com/p/37095662)
- [完全理解React Fiber](http://www.ayqy.net/blog/dive-into-react-fiber/)
- [你真的理解setState吗？](https://zhuanlan.zhihu.com/p/39512941)
- [React事件机制 - 源码概览（上）](https://juejin.im/post/5bd32493f265da0ae472cc8e#heading-0)
- [React 常用面试题目与分析](https://zhuanlan.zhihu.com/p/24856035#tipjar)
- [为何要在componentDidMount里面发送请求？](https://juejin.im/post/5c70e67f6fb9a049ba42326b#heading-0)
- [那些年，自己没回答上来的react面试题](https://juejin.im/post/5c9b39e2f265da611f1d9b5f#heading-0)
- [React 16+版本中为什么用更新生命周期函数？](https://www.zhihu.com/question/278328905)
- [2019年17道高频React面试题及详解](https://juejin.im/post/5d5f44dae51d4561df7805b4#heading-0)
