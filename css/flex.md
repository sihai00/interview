# flex
弹性布局

容器属性：
- flex-direction：主轴的方向
    - row：默认
    - row-reverse
    - column
    - column-reverse
- flex-wrap：如果一条轴线排不下，如何换行
    - nowrap
    - wrap
    - wrap-reverse
- flex-flow：<flex-direction> || <flex-wrap>
- justify-content：主轴上的对齐方式
    - flex-start：默认
    - flex-end
    - center
    - space-between
    - space-around
- align-items：交叉轴上如何对齐
    - stretch：默认。如果项目未设置高度或设为auto，将占满整个容器的高度
    - baseline：基线对其
    - flex-start
    - flex-end
    - center
- align-content：定义了多根轴线的对齐方式
    - stretch：默认
    - flex-start
    - flex-end
    - center
    - space-between
    - space-around
  
项目属性：
- order：项目的排列顺序
- flex-grow：放大比例。默认为0，即如果存在剩余空间，也不放大
- flex-shrink：缩小比例。默认为1，即如果空间不足，该项目将缩小
- flex-basis：项目占据的主轴空间
- flex：<'flex-grow'> <'flex-shrink'>? || <'flex-basis'>
- align-self：单个项目有与其他项目不一样的对齐方式
    - auto
    - flex-start
    - flex-end
    - center
    - baseline
    - stretch

## 参考
[Flex 布局教程：语法篇](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)
[Flex 布局教程：实例篇](http://www.ruanyifeng.com/blog/2015/07/flex-examples.html)
