# Webpack原理

没有分包
- 全局modules存储了所有的模块，当依赖某个模块的时候，调用__webpack_require__来接受执行这个模块的返回，一层层递归下去，最终输出结果

分包
1. 全局挂载webpackJsonp，修改webpackJsonp.push方法
2. 当分包的chunk调用webpackJsonp.push方法时，会进入webpackJsonpCallback方法
3. 接受chunkIds（标记已加载）、moreModules（添加到全局变量modules上，表示加载的模块）、executeModules（当前需要执行的模块）三个参数
4. 最后进去checkDeferredModules方法，执行模块
5. 当依赖某个模块的时候，调用__webpack_require__来接受执行这个模块的返回，一层层递归下去，最终输出结果

## webpack运行流程
初始化参数：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数；
开始编译：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译；
确定入口：根据配置中的 entry 找出所有的入口文件；
编译模块：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理；
完成模块编译：在经过第4步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系；
输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会；
输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。

1. entry-options阶段：option初始化，创建compiler对象（负责文件监听和启动编译），调用插件的apply方法
2. （执行compiler.run方法）-> compile阶段：开始编译，构建compilation对象（负责模块资源、编译生成资源、变化的文件）
3. （执行compiler.compile方法）-> make阶段：分析入口文件，创建模块对象
4. （执行compiler.addEntry方法）-> build-module阶段：使用 Loader 对文件进行编译，使用acorn转化为AST树，编译完后再找出该文件依赖的文件，递归的编译和解析
5. after-compile：完成所有模块构建，结束编译过程（得到了每个模块被翻译后的内容以及相互的依赖关系），根据依赖关系开始生成 Chunk。
6. （执行compiler.seal方法）-> emit阶段：compiler开始输出生内容（插件有最后的机会修改assets）
7. after-emit：输出完成

## Compiler和Compilation区别
Compiler 代表了整个 Webpack 从启动到关闭的生命周期，而 Compilation 只是代表了一次新的编译
- Compiler：控制流程。负责文件监听和启动编译，包含了完整的 Webpack 配置，全局只有一个 Compiler
- Compilation：专业解析。包含了当前的模块资源、编译生成资源、变化的文件等

## loader使用
webpack 可以使用 loader 来预处理文件。这允许你打包除 JavaScript 之外的任何静态资源
```javascript
const loaderUtils = require("loader-utils");

module.exports = function(content){
  // 获取用户配置的options
  const options = loaderUtils.getOptions(this);
  
  // 同步
  // 1. return value
  // 2. this.callback(err, value)
  this.callback(null, "{};" + content)
}

module.exports = async function(content){
  function timeout(delay) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("{};" + content)
      }, delay)
    })
  }
  
  // 异步
  // 1. return await value
  // 2. this.async()
  
  return await timeout(1000)
  
  // timeout(1000).then(data => {
  //   this.async(null, data)
  // })
}
```

## plugin
plugin为webpack提供各种功能
原理：
1. Webpack 启动后，在读取配置的过程中会先执行 new BasicPlugin(options) 初始化一个 BasicPlugin 获得其实例。 
2. 在初始化 compiler 对象后，再调用 basicPlugin.apply(compiler) 给插件实例传入 compiler 对象。 
3. 插件实例在获取到 compiler 对象后，就可以通过 compiler.plugin(事件名称, 回调函数) 监听到 Webpack 广播出来的事件。 并且可以通过 compiler 对象去操作 Webpack。

- tap：监听事件
- call：广播事件
```javascript
// webpack.config.js
const MyPlugin = require('./plugins/MyPlugin')

module.exports = {
  ...,
  plugins: [
    new MyPlugin()
  ]
}
```
```javascript
// 用正则，去除注释
class MyPlugin {
  constructor(options) {
    this.options = options
    this.externalModules = {}
  }

  apply(compiler) {
    var reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)|(\/\*\*\*\*\*\*\/)/g
    compiler.hooks.emit.tap('CodeBeautify', (compilation)=> {
      Object.keys(compilation.assets).forEach(data => {
        let content = compilation.assets[data].source() // 欲处理的文本
        content = content.replace(reg, function (word) { // 去除注释后的文本
          return /^\/{2,}/.test(word) || /^\/\*!/.test(word) || /^\/\*{3,}\//.test(word) ? "" : word;
        });
        compilation.assets[data] = {
          source(){
            return content
          },
          size(){
            return content.length
          }
        }
      })
    })
  }
}
module.exports = MyPlugin
```

## 参考
[webpack-loader](https://github.com/jerryOnlyZRJ/webpack-loader)
[干货！撸一个webpack插件(内含tapable详解+webpack流程)](https://juejin.im/post/5beb8875e51d455e5c4dd83f#heading-17)
[webpack原理](https://segmentfault.com/a/1190000015088834#articleHeader0)
