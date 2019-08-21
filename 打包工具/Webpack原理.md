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
1. entry-options：option初始化
2. compile：创建compiler，开始编译
3. make：分析入口文件，创建模compilation对象
4. build-module：使用loader对模块翻译，构建模块
5. after-compile：完成所有模块构建，结束编译过程（得到了每个模块被翻译后的内容以及相互的依赖关系）
6. emit：compiler开始输出生成的assets，插件有最后的机会修改assets
7. after-emit：输出完成

## loader使用
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
  // 1. return value
  // 2. this.async()
  
  return await timeout(1000)
  
  // timeout(1000).then(data => {
  //   this.async(null, data)
  // })
}
```

## plugin
- tap：监听事件
- call：广播事件
```javascript
//@file: plugins/myplugin.js
class myPlugin {
  constructor(options){
    //用户自定义配置
    this.options = options
    console.log(this.options)
  }
  apply(compiler) {
    console.log("This is my first plugin.")
  }
}

module.exports = myPlugin
```
