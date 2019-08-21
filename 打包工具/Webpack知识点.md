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
