# Webpack知识点

## webpack 中，module，chunk 和 bundle 的区别是什么？
module，chunk 和 bundle 其实就是同一份逻辑代码在不同转换场景下的取了三个名字
代码文件是 module，webpack 处理时是 chunk，最后生成浏览器可以直接运行的 bundle

## filename 和 chunkFilename 的区别
- filename 指列在 entry 中，打包后输出的文件的名称。
- chunkFilename 指未列在 entry 中，却又需要被打包出来的文件的名称。

## webpackPrefetch、webpackPreload 和 webpackChunkName 到底是干什么的？
- webpackChunkName：是为预加载的文件取别名。和output.chunkFilename组合为 `webpackChunkName + '.' + output.chunkFilename`
- webpackPrefetch（对应rel=prefetch）：会在浏览器闲置下载文件
- webpackPreload（对应rel=preload）：会在父 chunk 加载时并行下载文件

## hash、chunkhash、contenthash 有什么不同？
- hash：计算与整个项目的构建相关；
- chunkhash：计算与同一 chunk 内容相关；
- contenthash：计算与文件内容本身相关。

## 为何有的地方使用 require 去引用一个模块时需要加上 default？ 例如：require('xx').default
因为es6的export转化成es5会带default的对象，所以当require的是es6模块时，会带有default
```js
export default 123;
export const a = 123;
const b = 3;
const c = 4;
export { b, c };
```
babel 会将这些统统转换成 commonjs 的 exports。
```js
exports.default = 123;
exports.a = 123;
exports.b = 3;
exports.c = 4;
exports.__esModule = true;
```

## 经常在各大UI组件引用的文档上会看到说明 import { button } from 'xx-ui' 这样会引入所有组件内容，需要添加额外的 babel 配置，比如 babel-plugin-component？
因为import会转化为commonjs，导致组件全部引入。所以使用`babel-plugin-component`，只引入需要的模块
```js
import { Button, Select } from 'element-ui'
```
```js
var a = require('element-ui');
var Button = a.Button;
var Select = a.Select;
```
```js
// babel-plugin-component转换
import Button from 'element-ui/lib/button'
import Select from 'element-ui/lib/select'
```

## 为什么可以使用 es6 的 import 去引用 commonjs 规范定义的模块，或者反过来也可以又是为什么？
使用了 es6 的模块系统，如果借助 babel 的转换，es6 的模块系统最终还是会转换成 commonjs 的规范，那么引用commonjs 规范定义的模块自然没问题

## 我们在浏览一些 npm 下载下来的 UI 组件模块时（比如说 element-ui 的 lib 文件下），看到的都是 webpack 编译好的 js 文件，可以使用 import 或 require 再去引用。但是我们平时编译好的 js 是无法再被其他模块 import 的，这是为什么？
webpack 提供了 output.libraryTarget 配置指定构建完的 js 的用途
- val：`var test = returned_module_exports`
- commonjs：`exports['name'] = returned_module_exports`
- commonjs2：`module.exports = module.exports`

## babel 在模块化的场景中充当了什么角色？以及 webpack ？哪个启到了关键作用？
- 区别：
    - webpack可以将es6模块化转化为webpack模块化，并且可以做静态分析，使用tree-shaking
    - babel把es6转换为es5，包括模块语法转换
- 角色：babel 能提前将 es6 的 import 等模块关键字转换成 commonjs 的规范。这样 webpack 就无需再做处理

## 听说 es6 还有 tree-shaking 功能，怎么才能使用这个功能？
1. 关闭babel模块转化 + UglifyJS
2. 使用babel7 + UglifyJS
3. babel6 + sideEffects + UglifyJS
4. terser-webpack-plugin

## 参考
- [面试必备！webpack 中那些最易混淆的 5 个知识点](https://juejin.im/post/5cede821f265da1bbd4b5630)
- [import、require、export、module.exports 混合使用详解](https://juejin.im/post/5a2e5f0851882575d42f5609#heading-0)
