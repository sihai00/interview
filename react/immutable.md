# immutable
- 持久化数据结构
- 结构共享

## 例子
1. 假设你有这样的一个 Javascript 结构对象：
```javascript
const data = {
  to: 7,
  tea: 3,
  ted: 4,
  ten: 12,
  A: 15,
  i: 11,
  in: 5,
  inn: 9
}
```

2. 可以想象它在 Javscript 内存里的存储结构是这样的：
![immutable1](https://user-gold-cdn.xitu.io/2018/3/21/1624915298958fb9?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

3. 但我们还可以根据 key 使用到的字母作为索引，组织成字典查找树的结构：
![immutable2](https://user-gold-cdn.xitu.io/2018/3/21/1624915461dceeca?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

4. 在这种数据结构中，无论你想访问对象任意属性的值，从根节点出发都能够访问到。当你想修改值时，只需要创建一棵新的字典查找树，并且最大限度的利用已有节点即可
假设此时你想修改 tea 属性的值为14，首先需要找到访问到tea节点的关键路径:
![immutable3](https://user-gold-cdn.xitu.io/2018/3/21/16249157caab57e4?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

5. 然后将这些节点复制出来，构建一棵一摸一样结构的树，只不过新树的其他的节点均是对原树的引用：
![immutable4](https://user-gold-cdn.xitu.io/2018/3/21/162491599e80a98f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

6. 最后将新构建的树的根节点返回

## 参考
[React + Redux 性能优化（二）工具篇： Immutablejs](https://juejin.im/post/5ab273b5f265da239a5fb2e6#heading-0)
