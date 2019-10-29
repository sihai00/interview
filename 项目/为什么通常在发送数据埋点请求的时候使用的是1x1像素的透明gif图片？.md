## 为什么通常在发送数据埋点请求的时候使用的是 1x1 像素的透明 gif 图片？
- 跨域友好（不需要处理数据也不需要响应内容）
- 执行过程无阻塞（new Image并且赋值src即可）
- 体积最小（最小的BMP文件需要74个字节，PNG需要67个字节，而合法的GIF，只需要43个字节）

## 参考
[为什么通常在发送数据埋点请求的时候使用的是 1x1 像素的透明 gif 图片？](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/87)
[为什么前端监控要用GIF打点](https://mp.weixin.qq.com/s/v6R2w26qZkEilXY0mPUBCw?utm_source=tuicool&utm_medium=referral)
