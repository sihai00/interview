# 资源加载优先级Preload和Prefetch
- preload 是告诉浏览器页面**必定**需要的资源，浏览器**一定**会加载这些资源。
- prefetch 是告诉浏览器页面**可能**需要的资源，浏览器**不一定**会加载这些资源。（因为浏览器不一定有空闲时间）

优点：
1. 加载和执行分离，不阻塞浏览器渲染（除非构建完dom树后还没加载完）
2. 加载时间更多，渲染越快

## 1. 资源加载两次
1. preload 和 prefetch 混用的话，并不会复用资源，而是会重复加载。
2. 用 preload 加载不带crossorigin的跨域资源

## 1.1 preload 和 prefetch 混用
```html
<link rel="preload"   href="https://at.alicdn.com/t/font_zck90zmlh7hf47vi.woff" as="font">
<link rel="prefetch"  href="https://at.alicdn.com/t/font_zck90zmlh7hf47vi.woff" as="font">
```
![preload 和 prefetch 混用](https://user-gold-cdn.xitu.io/2018/2/11/16182c9d024a861b?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 1.2 用 preload 加载不带crossorigin的跨域资源
![chrome资源加载优先级](https://user-gold-cdn.xitu.io/2018/2/11/16182c9d3ff9f3c2?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

对于font的加载，有两个级别：Highest和High。假如用两个方式加载同一font资源：
1. css 样式文件中有一个 @font-face 依赖一个 font 文件，加载优先级是 High
2. 样式文件中依赖的字体文件设置preload，加载的优先级是 Highest`<link rel="preload" as="font" href="https://at.alicdn.com/t/font_zck90zmlh7hf47vi.woff">`

结果是加载两次同一个font文件
![结果](https://user-gold-cdn.xitu.io/2018/2/11/16182c9d39e6a355?imageslim)

原因是由于其来源的origin不同，浏览器判断不是同一缓存文件
![结果](https://user-gold-cdn.xitu.io/2018/2/11/16182c9d959d176e?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
![结果](https://user-gold-cdn.xitu.io/2018/2/11/16182c9d9b47ac32?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

解法：添加crossorigin。例如：`<link rel="preload" as="font" crossorigin href="https://at.alicdn.com/t/font_zck90zmlh7hf47vi.woff">`

## 参考
[用 preload 预加载页面资源](https://juejin.im/post/5a7fb09bf265da4e8e785c38#heading-0)
[HTTP/2 PUSH(推送)与HTTP Preload(预加载)大比拼| Dexecure](https://www.zcfy.cc/article/http-2-push-vs-http-preload-dexecure-4722.html?t=new)
[Preload，Prefetch 和它们在 Chrome 之中的优先级](https://github.com/xitu/gold-miner/blob/master/TODO/preload-prefetch-and-priorities-in-chrome.md)
