# worker
浏览器开启多线程

1. 同源限制：分配给 Worker 线程运行的脚本文件，必须与主线程的脚本文件同源
2. DOM 限制：Worker 线程所在的全局对象，与主线程不一样，无法读取主线程所在网页的 DOM 对象（document、window、parent）。但是，Worker 线程可以navigator对象和location对象
3. 通信联系：Worker 线程和主线程不在同一个上下文环境，它们不能直接通信，必须通过消息完成。
4. 脚本限制：Worker 线程不能执行alert()方法和confirm()方法，但可以使用 XMLHttpRequest 对象发出 AJAX 请求。
5. 文件限制：Worker 线程无法读取本地文件，即不能打开本机的文件系统（file://），它所加载的脚本，必须来自网络。

## web worker
1. 只属于某个页面，不会和其他页面的Render进程（浏览器内核进程）共享
2. 当页面关闭时，该页面新建的 Web Worker 也会随之关闭，不会常驻在浏览器中

## shared worker
1 .浏览器所有页面共享的，可以为多个Render进程共享使用

## service Worker
1. 服务于多个页面的
2. 常驻在浏览器中
3. 跟 Fetch 搭配，可以从浏览器层面拦截请求，做数据 mock
4. 跟 Fetch 和 CacheStorage 搭配，可以做离线应用；
5. 跟 Push 和 Notification 搭配，可以做像 Native APP 那样的消息推送

