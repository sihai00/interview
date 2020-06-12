# 08构建web应用

## 基础功能
- 请求方法的判断
- URL的路径解析
- URL中查询字符串解析
- Cookie的解析
  - 减小Cookie的大小
  - 为静态组件使用不同的域名
  - 减少DNS查询
- Session
  - 问题：内存溢出和多进程共享。
    - 解决：第三方缓存
  - 问题：第三方缓存会慢
    - Node与缓存服务保持长连接，而非频繁的短连接，握手导致的延迟只影响初始化。
    - 高速缓存直接在内存中进行数据存储和访问。
    - 缓存服务通常与Node进程运行在相同的机器上或者相同的机房里，网络速度受到的影响较小。
  - 问题：安全问题
    - 加密
- Basic认证：当客户端与服务器端进行请求时，允许通过用户名和密码实现的一种身份认证方式

## 数据上传
安全问题
- 内存限制
  - 限制上传内容的大小，一旦超过限制，停止接收数据，并响应400状态码。
  - 通过流式解析，将数据流导向到磁盘中，Node只保留文件路径等小数据。
- CSRF：跨站请求伪造
  - 后端生产随机码给到前端，前端存储在页面，提交表单时带上给后端进行验证

## 路由解析
- 文件路径型
- MVC
  - 路由解析，根据URL寻找到对应的控制器和行为
  - 行为调用相关的模型，进行数据操作
  - 数据操作结束后，调用视图和相关数据进行页面渲染，输出到客户端
- RESTful：表现层状态转化

```javascript
// 过去
`
POST /user/add? username=jacksontian
GET /user/remove? username=jacksontian
POST /user/update? username=jacksontian
GET /user/get? username=jacksontian
`
// RESTful
`
POST /user/jacksontian
DELETE /user/jacksontian
PUT /user/jacksontian
GET /user/jacksontian
`
```

## 中间件
来简化和隔离基础设施与业务逻辑之间的细节，让开发者能够关注在业务的开发上，以达到提升开发效率的目的
```javascript
app.use = function (path) {
  var handle;
  if (typeof path === 'string') {
    handle = {
      // 第一个参数作为路径
      path: pathRegexp(path),
      // 其他的都是处理单元
      stack: Array.prototype.slice.call(arguments, 1)
    };
  } else {
    handle = {
      // 第一个参数作为路径
      path: pathRegexp('/'),
      // 其他的都是处理单元
      stack: Array.prototype.slice.call(arguments, 0)
    };
  }
  routes.all.push(handle);
  };

var match = function (pathname, routes) {
  var stacks = [];
  for (var i = 0; i &lt; routes.length; i++) {
    var route = routes[i];
    // 正则匹配
    var reg = route.path.regexp;
    var matched = reg.exec(pathname);
    if (matched) {
      // 抽取具体值
      // 代码省略
      // 将中间件都保存起来
      stacks = stacks.concat(route.stack);
    }
  }
  return stacks;
};

var handle = function (req, res, stack) {
  var next = function () {
    // 从stack数组中取出中间件并执行
    var middleware = stack.shift();
    if (middleware) {
      // 传入next()函数自身，使中间件能够执行结束后递归
      middleware(req, res, next);
    }
  };

  // 启动执行
  next();
};

function (req, res) {
  var pathname = url.parse(req.url).pathname;
  // 将请求方法变为小写
  var method = req.method.toLowerCase();
  // 获取all()方法里的中间件
  var stacks = match(pathname, routes.all);
  if (routes.hasOwnPerperty(method)) {
    // 根据请求方法分发，获取相关的中间件
    stacks.concat(match(pathname, routes[method]));
  }

  if (stacks.length) {
    handle(req, res, stacks);
  } else {
    // 处理404请求
    handle404(req, res);
  }
}

app.use(querystring);
app.use(cookie);
app.use(session);
app.get('/user/:username', getUser);
app.put('/user/:username', authorize, updateUser);
```

## 页面渲染
### 内容响应
- MIME
- 附件下载：Content-Disposition
- Json
- 跳转

```javascript
// mime
res.writeHead(200, {'Content-Type': 'text/plain'});
res.end('&lt;html&gt;&lt;body&gt;Hello World&lt;/body&gt;&lt;/html&gt;\n');
// 或者
res.writeHead(200, {'Content-Type': 'text/html'});
res.end('&lt;html&gt;&lt;body&gt;Hello World&lt;/body&gt;&lt;/html&gt;\n');

// 附件下载
res.sendfile = function (filepath) {
  fs.stat(filepath, function(err, stat) {
    var stream = fs.createReadStream(filepath);
    // 设置内容
    res.setHeader('Content-Type', mime.lookup(filepath));
    // 设置长度
    res.setHeader('Content-Length', stat.size);
    // 设置为附件
    res.setHeader('Content-Disposition' 'attachment; filename="' + path.basename(filepath) + '"');
    res.writeHead(200);
    stream.pipe(res);
  });
};

// json
res.json = function (json) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(json));
};

// 跳转
res.redirect = function (url) {
  res.setHeader('Location', url);
  res.writeHead(302);
  res.end('Redirect to ' + url);
};
```

## 模板
```javascript
var render = function (str, data) {
  // 模板技术呢，就是替换特殊标签的技术
  var tpl = str.replace(/&lt;%=([\s\S]+? )%&gt;/g, function(match, code) {
    return "' + obj." + code + "+ '";
  });

  tpl = "var tpl = '" + tpl + "'\nreturn tpl; ";
  var complied = new Function('obj', tpl);
  return complied(data);
};

var tpl = 'Hello &lt;%=username%&gt;.';
console.log(render(tpl, {username: 'Jackson Tian'}));
// =&gt; Hello Jackson Tian.
```