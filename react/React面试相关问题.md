# React面试相关问题

## setState之后发生什么
- 在fiber节点上使用链表来记录这段时间内需要更新的任务来进行批量更新
- 进入调度阶段，React 会以相对高效的方式根据新的状态构建 React 元素树
- 比较新旧节点的差异，进行最小化的渲染

## 组件通信
- 父到子：props
- 子到父：父传函数，子以参数来调用父函数
- 兄弟间：父作为中间者来传递
- context
- 发布订阅模式
- Redux

## key的作用
用于追踪哪些列表中元素被修改、被添加或者被移除的辅助标识，减少不必要的渲染

## 生命周期以及作用
- 挂载阶段
    - constructor：初始化state和方法绑定
    - getDerivedStateFromProps（静态方法）：返回一个对象来更新 state。用于***state的值在任何时候都取决于 props***
    - render：组件挂载（插入 DOM 树中）
    - componentDidMount：***用于处理副作用（例如请求、动画）***
- 更新阶段
    - getDerivedStateFromProps（静态方法）：返回一个对象来更新 state。用于***state的值在任何时候都取决于 props***
    - shouldComponentUpdate：判断 React 组件的输出是否受当前 state 或 props 更改的影响。用于***性能优化***，建议使用***PureComponent组件***
        - return true：进行render
        - return false：不进行render
    - render：组件挂载（插入 DOM 树中）
    - getSnapshotBeforeUpdate：返回值作为componentDidUpdate的参数。它使得组件能在发生更改之前从 DOM 中捕获一些信息（例如，滚动位置）
    - componentDidUpdate：***用于处理副作用（例如请求、动画）***，注意它必须被包裹在一个条件语件里
- 卸载阶段
    - componentWillUnmount：在组件卸载及销毁之前直接调用。用于清理操作，例如，清除 timer，取消网络请求或清除在 componentDidMount() 中创建的订阅等
- 其他：
    - componentDidCatch：在后代组件抛出错误后被调用

## 为什么要在componentDidMount中发请求
1. 在挂载之前，数据其实并不存在。在constructor请求和componentDidMount请求其实是一样的
2. 假如是想让请求更早触发，但是React16不能保证constructor或者componentWillMount的触发次数，因为Fiber可以让React开始或者中断更新
3. 在将来componentWillMount会被废弃

## 为什么getDerivedStateFromProps是静态方法

## [Fiber架构](https://zhuanlan.zhihu.com/p/37095662)
1. Fiber架构相对于以前的递归更新组件有有什么优势
- 原因是递归更新组件会让js调用栈占用很长时间
- 因为浏览器是单线程的，GUI渲染线程和js线程是互斥的。当js线程长时间占用时，渲染就会延时，看上去就是卡顿
- Fiber架构将任务分片执行。当浏览器有空闲时，再去执行高优先级的任务，降低渲染阻塞。

2. 既然你说Fiber是将组件分段渲染，那第一段渲染之后，怎么知道下一段从哪个组件开始渲染呢
- fiber节点拥有return, child, sibling三个属性，分别对应父节点， 第一个孩子， 它右边的兄弟，有了它们就足够将一棵树变成一个链表，实现深度优化遍历

3. 怎么决定每次更新的数量
- React16则是需要将虚拟DOM转换为Fiber节点，首先它规定一个时间段内，然后在这个时间段能转换多少个FiberNode，就更新多少个。
- 因此我们需要将我们的更新逻辑分成两个阶段，第一个阶段是将虚拟DOM转换成Fiber, Fiber转换成组件实例或真实DOM（不插入DOM树，插入DOM树会reflow）。Fiber转换成后两者明显会耗时，需要计算还剩下多少时间。
- 比如，可以记录开始更新视图的时间var now = new Date - 0，假如我们更新试图自定义需要100毫秒，那么定义结束时间是var deadline = new Date + 100 ,所以每次更新一部分视图，就去拿当前时间new Date<deadline做判断，如果没有超过deadline就更新视图，超过了，就进入下一个更新阶段

4. 如何调度时间才能保证流畅
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


## React中元素与组件的区别
- 元素：React中最小基本单位，表示一个虚拟DOM对象
- 组件：由元素组成，可以是函数、类、React.createElement来创建

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

## 简述一下virtual DOM 如何工作
- 当数据发生变化的时候（例如setState），会重新渲染
- 通过diff算法比较新的虚拟dom和旧的虚拟dom
- 只更新渲染改变的虚拟dom，最后更新到真实的需要改变的dom节点上


## 参考
- [React 常用面试题目与分析](https://zhuanlan.zhihu.com/p/24856035#tipjar)
- [为何要在componentDidMount里面发送请求？](https://juejin.im/post/5c70e67f6fb9a049ba42326b#heading-0)
- [那些年，自己没回答上来的react面试题](https://juejin.im/post/5c9b39e2f265da611f1d9b5f#heading-0)
