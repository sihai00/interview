# webpack优化

- 缩小文件范围
    - test、include、exclude
    - resolve.modules：去哪些目录下寻找第三方模块（node_modules）
    - module.noParse：忽略对部分没采用模块化的文件的递归解析处理（例如：jquery）
- DllPlugin：一些第三方不常变动的库编译一次即可（例如：react、react-dom）
- HappyPack：多进程处理打包
- js压缩：可开启多进程和缓存（ParallelUglifyPlugin || TerserJSPlugin）
- 区分环境（压缩文件、去除日志、接口环境等）
- css压缩
- 文件hash和资源文件指向CDN服务器
- Tree Shaking
- 提取公共代码
- 分割代码按需加载
- 作用域提升（Scope Hoisting）
- 输出分析

## HappyPack原理
1. 核心调度器的逻辑代码在主进程中，也就是运行着 Webpack 的进程中，核心调度器会把一个个任务分配给当前空闲的子进程，
2. 子进程处理完毕后把结果发送给核心调度器，它们之间的数据交换是通过进程间通信 API 实现的
3. 核心调度器收到来自子进程处理完毕的结果后会通知 Webpack 该文件处理完毕。

## 文件监听工作原理
1. 假如多文件：递归解析出 Entry 文件所依赖的文件，把这些依赖的文件都加入到监听列表中去
2. 定时的去获取这个文件的最后编辑时间，每次都存下最新的最后编辑时间，
3. 如果发现当前获取的和最后一次保存的最后编辑时间不一致，就认为该文件发生了变化
4. 当发现某个文件发生了变化时，并不会立刻告诉监听者，而是先缓存起来，收集一段时间的变化后，再一次性告诉监听者。（因为事件高频的发生会让构建卡死）

## 自动刷新的原理
1. 借助浏览器扩展去通过浏览器提供的接口刷新，WebStorm IDE 的 LiveEdit 功能就是这样实现的。
2. 往要开发的网页中注入代理客户端代码，通过代理客户端去刷新整个页面。
3. 把要开发的网页装进一个 iframe 中，通过刷新 iframe 去看到最新效果。

webpack-dev-server支持2、3种方法，默认第2种

## 模块热替换的原理
模块热替换的原理和自动刷新原理类似，都需要往要开发的网页中注入一个代理客户端用于连接 DevServer 和网页， 不同在于模块热替换独特的模块替换机制

## 如何区分环境
借助于环境变量的值去判断执行哪个分支
- 当你的代码中出现了使用 process 模块的语句时，Webpack 就自动打包进 process 模块的代码以支持非 Node.js 的运行环境。
- 当你的代码中没有使用 process 时就不会打包进 process 模块的代码。
这个注入的 process 模块作用是为了模拟 Node.js 中的 process，以支持 process.env.NODE_ENV === 'production' 类语句

## CDN加速
前端资源部署方案
- 针对 HTML 文件：不开启缓存。把 HTML 放到自己的服务器上，而不是 CDN 服务上，同时关闭自己服务器上的缓存。自己的服务器只提供 HTML 文件和数据接口。
- 针对静态的 JavaScript、CSS、图片等文件：开启缓存。放到 CDN 服务上去，同时给每个文件名带上由文件内容算出的 Hash 值，带上 Hash 值的原因是文件名会随着文件内容而变化，只要文件发生变化其对应的 URL 就会变化，它就会被重新下载，无论缓存时间有多长。

浏览器有并发限制：
- 资源放到不同域名CDN服务上

多域名的缺点：
- 增加了域名解析时间

解决：
- 可以通过在 HTML HEAD 标签中 加入` <link rel="dns-prefetch" href="//js.cdn.com"> ` 去预解析域名，以降低域名解析带来的延迟
- 根据自己的需求去衡量得失

## Tree Shaking
用来剔除 JavaScript 中用不上的死代码，依赖静态的 ES6 模块化语法

注意：
- 需要配置 Babel 让其保留 ES6 模块化语句 `"presets": [["env", {"modules": false}]]`

## 提取公共代码
- 基础库：例如react、react-dom
- 公共代码

## 分割代码按需加载
库按需加载：
1. 配置output.chunkFilename： `[name].js`
2. 需要的地方： `import(/* webpackChunkName: "show" */ './show').then((show) => show('wepback')`

react-router按需加载：
1. Route.component接受一个高阶组件，来渲染页面
2. 当componentDidMount时，执行import()按需加载页面，加载成功后设置到当前组件的state上
3. 组件渲染state

```typescript jsx
import React, {PureComponent, createElement} from 'react';
import {render} from 'react-dom';
import {HashRouter, Route, Link} from 'react-router-dom';
import PageHome from './pages/home';

/**
 * 异步加载组件
 * @param load 组件加载函数，load 函数会返回一个 Promise，在文件加载完成时 resolve
 * @returns {AsyncComponent} 返回一个高阶组件用于封装需要异步加载的组件
 */
function getAsyncComponent(load) {
  return class AsyncComponent extends PureComponent {

    componentDidMount() {
      // 在高阶组件 DidMount 时才去执行网络加载步骤
      load().then(({default: component}) => {
        // 代码加载成功，获取到了代码导出的值，调用 setState 通知高阶组件重新渲染子组件
        this.setState({
          component,
        })
      });
    }

    render() {
      const {component} = this.state || {};
      // component 是 React.Component 类型，需要通过 React.createElement 生产一个组件实例
      return component ? createElement(component) : null;
    }
  }
}

// 根组件
function App() {
  return (
    <HashRouter>
      <div>
        <nav>
          <Link to='/'>Home</Link> | <Link to='/about'>About</Link> | <Link to='/login'>Login</Link>
        </nav>
        <hr/>
        <Route exact path='/' component={PageHome}/>
        <Route path='/about' component={getAsyncComponent(
          // 异步加载函数，异步地加载 PageAbout 组件
          () => import(/* webpackChunkName: 'page-about' */'./pages/about')
        )}
        />
        <Route path='/login' component={getAsyncComponent(
          // 异步加载函数，异步地加载 PageAbout 组件
          () => import(/* webpackChunkName: 'page-login' */'./pages/login')
        )}
        />
      </div>
    </HashRouter>
  )
}

// 渲染根组件
render(<App/>, window.document.getElementById('app'));
```

ps：代码可能不认识 `import` 语法，可以借助 `babel-plugin-syntax-dynamic-import`

## 作用域提升（Scope Hoisting）
分析出模块之间的依赖关系，尽可能的把打散的模块合并到一个函数中去，但前提是不能造成代码冗余。 因此只有那些被引用了一次的模块才能被合并
- 需采用 ES6 模块化语法
```javascript
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');

module.exports = {
  resolve: {
    // 针对 Npm 中的第三方模块优先采用 jsnext:main 中指向的 ES6 模块化语法的文件
    mainFields: ['jsnext:main', 'browser', 'main']
  },
  plugins: [
    // 开启 Scope Hoisting
    new ModuleConcatenationPlugin(),
  ],
};
```

## 输出分析
- 执行 `webpack --profile --json` 命令，输出 stats.json
    - 可视化分析工具 `Webpack Analyse`（Webpack 官方）
    - 可视化工具 `webpack-bundle-analyzer`

## 参考
深入浅出webpack第四章
