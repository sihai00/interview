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

## key的作用
用于追踪哪些列表中元素被修改、被添加或者被移除的辅助标识，减少不必要的渲染

## 为什么要在componentDidMount中发请求
- Fiber可以让React开始或者中断更新，不能保证componentWillMount的触发次数
- 由于请求是异步的，如果以请求数据来作为初始数据的话，会先渲染空白再渲染正常数据，用户体验不好
- 在将来componentWillMount会被废弃

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
