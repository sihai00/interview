# GitFlow 开发流程
GitFlow 比前文讲的基于功能分支的开发流程要复杂得多，它更适合大型的复杂项目

- Master分支：用于存放线上版本代码，可以方便的给代码打版本号。
- Develop分支：用于整合 Feature 分支。 
- Feature分支：某个功能的分支，从 Develop 分支切出，并且功能完成时又合并回 Develop 分支，不直接和 Master 分支交互。 
- Release分支：通常对应一个迭代。将一个版本的功能全部合并到 Develop 分支之后，从 Develop 切出一个 Release 分支。这个分支不在追加新需求，可以完成 bug 修复、完善文档等工作。务必记住，代码发布后，需要将其合并到 Master 分支，同时也要合并到 Develop 分支。
- Hotfix分支：紧急修复的分支，是唯一可以从 Master 切出的分支，一旦修复了可以合并到 Master 分支和 Develop 分支。

## 参考
- [Git超实用总结，再也不怕记忆力不好了](https://juejin.im/post/5bc552ace51d450ea246e7bf#heading-6)
