# Gulp和Webpack区别

## Gulp
Gulp是自动化构建工具，简化前端流程，把一个个工具按流程整合起来的构建工具。
比如以前想用sass写css，我必须手动的用相应的compiler去编译压缩各自的文件。对于图片，又需要找工具来压缩。
后来Gulp诞生，把编译sass和压缩图片这些工具按照流程来自动化实现，只需要gulp build就可以了

但是它没有解决js module 的问题，写代码时候如何组织代码结构的问题

## Webpack
Webpack是预编译的模块打包工具，是一整套打包工具的解决方案。
Webpack认为所有的资源文件就是一个个的模块，把所有的模块都用js来生成依赖，最后生成一个bundle。
它通过plugins对模块控制，实现按需加载，通过loader可以处理各种文件，可以 AMD / CMD / ES6 风格的模块化，编译成浏览器认识的JS。

Gulp缺点：
1. Gulp的构建需要查找一个个工具，自行组装自动化流程。而Webpack内置了很多构建工具，通过配置就可以实现打包。
2. Gulp使用工具必须整个加载。而Webpack可以树摇，按需加载。
3. 开发环境，Gulp修改一个文件，会导致整个项目重新打包。
4. 开发环境，gulp的构建是在磁盘上的。webpack的构建是在内存上的，比Gulp快很多。
5. gulp插件相比webpack插件少且长年不维护。

## 参考
[gulp和webpack究竟有什么区别？](https://segmentfault.com/q/1010000008058766)
