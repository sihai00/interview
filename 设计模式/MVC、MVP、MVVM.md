# MVC、MVP、MVVM

## MVC模式
模型（Model）、视图（View）和控制器（Controller）
所有通信都是单向的

1. View 传送指令到 Controller
2. Controller 完成业务逻辑后，要求 Model 改变状态
3. Model 将新的数据发送到 View，用户得到反馈

缺点：
- 业务逻辑主要集中在Controller，变得十分臃肿
- MVC中View和Controller一般是一一对应的，捆绑起来表示一个组件，View层与Controller层耦合紧密，Controller的复用性成了问题

![mvc](http://www.ruanyifeng.com/blogimg/asset/2015/bg2015020105.png)

## MVP
模型（Model）、视图（View）和 Presenter
Model和Presenter是双向通信，View和Presenter是双向通信，Model和View不通信

优点：
- 完全分离视图和模型使职责划分更加清晰
- 由于View不依赖Model，可以将View抽离出来做成组件

缺点：
- Presenter很重，维护起来会比较困难
- 需要手动同步数据从Model到View

![mvp](http://www.ruanyifeng.com/blogimg/asset/2015/bg2015020109.png)

## MVVM
模型（Model）、视图（View）和 ViewModel
唯一的区别是，它采用双向绑定（data-binding）：View的变动，自动反映在 ViewModel，反之亦然

优点：
- 通过双向绑定，同步逻辑自动化

缺点：
- 错误定位：可能是View层也可能是ViewModel层

![mvvm](http://www.ruanyifeng.com/blogimg/asset/2015/bg2015020110.png)

## 参考
[MVC，MVP 和 MVVM 的图示 - 阮一峰](http://www.ruanyifeng.com/blog/2015/02/mvcmvp_mvvm.html)
[浅析前端开发中的 MVC/MVP/MVVM 模式](https://juejin.im/post/593021272f301e0058273468#heading-0)
