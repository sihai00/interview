# BFC、IFC、GFC和FFC

## 1.文档流
- 定位流：position
- 浮动流：float
- 普通流（FC格式化上下文）：BFC、IFC、GFC、FFC

## 2.普通流
格式化上下文，它是页面中的一块渲染区域，有一套渲染规则，决定了其子元素如何布局，以及和其他元素之间的关系和作用。

### 2.1 BFC 
块级格式化上下文：是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面元素
触发：
1. 根元素
2. float属性不为none
3. position为absolute、fixed
4. display为inline-block、table-cell、table-caption、flex、inline-flex
5. overflow不为visible( hidden、scroll、auto )

规则：
1. 内部的Box会在垂直方向，一个接一个地放置。
2. Box垂直方向的距离由margin决定。属于同一个BFC的两个相邻Box的margin会发生重叠。
3. BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。
4. 每个元素的margin box的左边， 与包含块border box的左边相接触(对于从左往右的格式化，否则相反)。即使存在浮动也是如此。
5. BFC的区域不会与float box重叠。
6. 计算BFC的高度时，浮动元素也参与计算

应用场景：
1. 防止margin重叠（规则3）
2. 两栏布局（规则4）
3. 清除浮动（规则6）

### 2.2 IFC
触发条件：
一个块级元素中仅包含内联级别元素

应用场景：
1. 水平居中：当一个块要在环境中水平居中时，设置其为 inline-block 则会在外层产生 IFC，通过设置父容器 text-align:center 则可以使其水平居中。
2. 垂直居中：创建一个IFC，用其中一个元素撑开父元素的高度，然后设置其 vertical-align:middle，其他行内元素则可以在此父元素下垂直居中。

### 2.3 GFC
触发条件
display：flex、inline-flex

布局规则：
设置为 flex 的容器被渲染为一个块级元素
设置为 inline-flex 的容器则渲染为一个行内元素
弹性容器中的每一个子元素都是一个弹性项目。弹性项目可以是任意数量的。弹性容器外和弹性项目内的一切元素都不受影响。简单地说，Flexbox 定义了弹性容器内弹性项目该如何布局

### 2.4 FFC
触发条件
display：grid

布局规则：
1. 在网格容器（grid container）上定义网格定义行（grid definition rows）和网格定义列（grid definition columns）属性各
2. 在网格项目（grid item）上定义网格行（grid row）和网格列（grid columns）为每一个网格项目（grid item）定义位置和空间

## 参考
[CSS中各种布局的背后(*FC)](https://segmentfault.com/a/1190000013372963)
[[布局概念] 关于CSS-BFC深入理解](https://juejin.im/post/5909db2fda2f60005d2093db#heading-0)
