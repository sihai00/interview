# grid
网格布局

Grid 布局远比 Flex 布局强大：
- Flex 布局是轴线布局，只能指定"项目"针对轴线的位置，可以看作是一维布局。
- Grid 布局则是将容器划分成"行"和"列"，产生单元格，然后指定"项目所在"的单元格，可以看作是二维布局。

单位：
- px
- 百分比 
- repeat(重复次数, 重复格式)
- auto-fill：容纳尽可能多的单元格
- fr：网格相对单位（例如：如果两列的宽度分别为1fr和2fr，就表示后者是前者的两倍。）
- minmax：范围
- auto：单元格的最大宽度

容器属性：
- 划分
    - grid-template-columns：定义列
    - grid-template-rows 定义行
- 间隔
    - grid-row-gap
    - grid-column-gap
    - grid-gap
- 区域
    - grid-template-areas
- 方向
    - grid-auto-flow
        - row：先行后列
        - column：先列后行
- 项目的显示方式
    - justify-content
        - start
        - end
        - center
        - stretch
        - space-between：项目与项目的间隔相等，项目之间的间隔比项目与容器边框的间隔大一倍
        - space-around：每个项目两侧的间隔相等
        - space-evenly：项目与项目的间隔相等，项目与容器边框之间也是同样长度的间隔
    - align-content
    - place-content
- 单元格内容的显示方式
    - justify-items：水平位置
        - start
        - end
        - center
        - stretch
    - align-items：垂直位置
    - place-items: <align-items> <justify-items>
- 项目的指定位置，在现有网格的外部
    - grid-auto-columns
    - grid-auto-rows

项目属性：
- 项目的位置
    - grid-column-start
    - grid-column-end
    - grid-row-start
    - grid-row-end
    - grid-column：grid-column-start / grid-column-end
    - grid-row：grid-row-start / grid-row-end
- 项目放在哪一个区域
    - grid-area
- 项目显示方式：
    - justify-self
    - align-self
    - place-self
    
## 参考
[CSS Grid 网格布局教程](http://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)
