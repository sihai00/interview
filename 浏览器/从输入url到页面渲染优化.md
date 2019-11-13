# 从输入url到页面渲染优化

## 过程
1. DNS域名解析
    1. 在浏览器地址栏输入URL
    2. 浏览器解析URL获取协议，主机，端口，path
    3. 浏览器组装一个HTTP（GET）请求报文
    4. 浏览器进行DNS查询域名对应的ip地址
2. 建立TCP连接
    5. 端口通过三次握手与目标IP地址建立TCP链
    6. TCP链接建立后发送HTTP请求
3. 下载资源
    7. 服务器将响应报文通过TCP连接发送回浏览器，浏览器接收HTTP响应
4. 解析页面
    8. 解析html，构建DOM树
    9. 下载资源并解析
        - 解析css，构建CSSOM树
        - 解析js，js可能会通过api来操作DOM树和CSSOM树
    10. 构建render树：结合DOM树和CSSOM树
    11. 布局（layout）：计算每个节点在屏幕中的精确位置与大小
    12. 绘制（repaint）：将渲染树按照上一步计算出的位置绘制到图层上
    13. 合成（composite）：浏览器会将各层的信息发送给GPU，GPU会将各层合成，显示在屏幕上

浏览器渲染一帧步骤：
- JavaScript：JavaScript 实现动画效果，DOM 元素操作等
- Style（计算样式）：确定每个 DOM 元素应该应用什么 CSS 规则
- Layout（布局）：计算每个 DOM 元素在最终屏幕上显示的大小和位置
- Paint（绘制）：在多个层上绘制 DOM 元素的的文字、颜色、图像、边框和阴影等
- Composite（渲染层合并）：按照合理的顺序合并图层然后显示到屏幕上

## DNS域名解析优化
1. 域名预解析
    meta： `<meta http-equiv="x-dns-prefetch-control" content="on">`
    link： `<link rel="dns-prefetch" href="//www.xx.com">`

## 建立TCP连接优化
1. 使用CDN：减少数据往返延迟（地理位置远近关系）
2. 使用HTTP2：
    - 多路复用
    - header压缩
    - 服务端推送
3. 减少cookie

## 下载资源优化
1. 避免不必要的重定向
2. 避免404
3. 避免img的src为空
4. 添加子域名：增加并发数量
5. 启用gzip压缩
6. 启用缓存：强缓存和协商缓存

## 解析页面优化
1. 外链文件相关
    - 位置：css文件外链放头部、js文件外链放底部
    - 压缩：压缩js、css等文件
2. 图片
    - 合并：雪碧图
    - 格式：svg、webp等
    - 图标字体
    - 行内图片：base64
3. 避免重排：通常由元素的结构、增删、位置、尺寸变化引起
    - 脱离文档流
    - 开启复合层：3d硬件加速 + zIndex
        - translate3d
        - opacity
    - 避免table布局：使用弹性布局替代
4. 首屏优化
    - 单页应用
        - 按需加载：react-loadable、react.lazy + react.Suspense
        - 分包：基础库、提取公共代码
    - 压缩：减少资源文件的大小
    - 图片
        - 压缩
        - base64或者svg内嵌到html中
        - 图标字体
        - 雪碧图
        - 懒加载：原理是当componentDidMount后渲染图片（react-lazyload）
    - CDN
    - 服务端渲染
    - 次屏逻辑延后处理和执行。例如埋点
5. 交互优化
    - 预加载
    - 懒加载
        - ajax请求渲染：例如多页列表加载
        - setTimeout渲染：延迟渲染不重要部分
    - 防抖
    - 节流
    - 骨架屏
        - 图片：base64、svg
        - css占位
        - 第三方插件：react-content-loader 
    - web worker
6. 渲染优化
    - 切片：requestAnimationFrame
    - 文档片段：DocumentFragment

## 参考
- [面试杂项](https://fanerge.github.io/2018/面试杂项.html)  
- [从输入 url 开始能做哪些优化](https://juejin.im/post/5ad578ba6fb9a028cc61b89f#heading-1)
- [GPU加速是什么](https://aotu.io/notes/2017/04/11/GPU/?o2src=juejin&o2layout=compat)
