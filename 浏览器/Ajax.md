# Ajax

## 1. 执行顺序
"readyState==1"的 onreadystatechange 回调以及 onloadstart 回调就是同步执行的
```javascript
function ajax(url, method){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
      console.log('xhr.readyState:' + this.readyState);
  }
  xhr.onloadstart = function(){
      console.log('onloadStart');
  }
  xhr.onload = function(){
      console.log('onload');
  }
  xhr.open(method, url, true);
  xhr.setRequestHeader('Cache-Control',3600);
  xhr.send();
}
var timer = setTimeout(function(){
  console.log('setTimeout');
},0);
ajax('https://user-gold-cdn.xitu.io/2017/3/15/c6eacd7c2f4307f34cd45e93885d1cb6.png','GET');
console.warn('这里的log并不是最先打印出来的.');

// xhr.readyState:1
// onloadStart
// 这里的log并不是最先打印出来的.
// setTimeout
// xhr.readyState:2
// xhr.readyState:3
// xhr.readyState:4
// onload
```

## 2. 属性
- readyState：ajax调用过程中所有可能的状态
    - 0：未初始化
    - 1：初始化
    - 2：发送数据（onloadstart、onloadend）
    - 3：数据传输中（onpregress）
    - 4：已完成（onload、onloadend）
- onreadystatechange：readystate状态改变时触发

- status：http请求的状态。例如：401、200
- statusText：服务器的响应状态信息。例如401的 `Unauthorized`

- onloadstart：请求发送之前触发
- onprogress：获取资源的下载进度，可通过 e.loaded/e.total 来计算加载资源的进度
- onload：请求成功后触发
- onloadend：请求完成后触发
- onerror：请求出错后执行
- abort：取消ajax请求
- upload：用于上传资源

- timeout：超时时长
- ontimeout：请求超时时触发

- responseText：服务器的响应内容
- responseXML：xml形式的响应数据
- responseType：响应的类型。可取 "arraybuffer" , "blob" , "document" , "json" , and "text" 共五种类型.
- responseURL：ajax请求最终的URL
- overrideMimeType：强制修改response的 Content-Type

- withCredentials：跨域请求是否发送cookie
- getResponseHeader：获取ajax响应头中指定name的值
- getAllResponseHeaders：获取所有安全的ajax响应头
- setRequestHeader：设置请求头

```javascript
xhr.onreadystatechange = function(e){
  if(xhr.readystate==4){
    var s = xhr.status;
    if((s >= 200 && s < 300) || s == 304){
      var resp = xhr.responseText;
      //TODO ...
    }
  }
}
```
## 3. XML
XML1缺点：
- 不能传输二进制数据
- 不能跨域
- 没有进度
- 没有超时机制

XML2
- 可以传输二进制数据
- 可通过CORS跨域
- 可通过xhr.upload.onpregress监听进度
- 可设置timeout和监听ontimeout

## 4. CORS
跨域资源共享，它允许浏览器向跨域服务器, 发出异步http请求, 从而克服了ajax受同源策略的限制

### 4.1 服务端头信息
- Access-Control-Allow-Origin：允许哪些源的网页发送请求
- Access-Control-Allow-Method：允许哪些请求方法.
- Access-Control-Allow-Credentials：是否允许cookie发送
- Access-Control-Allow-Headers：允许哪些常规的头域字段
- Access-Control-Expose-Headers：允许哪些额外的头域字段
- Access-Control-Max-Age：OPTIONS请求的有效期, 单位为秒

CORS请求时, xhr.getResponseHeader() 方法默认只能获取6个基本字段: Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma
如果需要获取其他字段, 就需要在Access-Control-Expose-Headers 中指定

### 4.2 浏览器OPTIONS
- Access-Control-Request-Method: 告知服务器,浏览器将发送哪种请求, 比如说POST.
- Access-Control-Request-Headers: 告知服务器, 浏览器将包含哪些额外的头域字段

### 4.3 CORS请求
- 简单请求
- 复杂请求：两次请求，第一次预检（用于验证来源是否合法），第二次正常HTTP请求

简单请求：
1. HEAD、GET、POST
2. http头域不超出以下几种字段
    - Accept
    - Accept-Language
    - Content-Language
    - Last-Event-ID
    - Content-Type字段限三个值：application/x-www-form-urlencoded、multipart/form-data、text/plain

HTML启用CORS：
http-equiv 相当于http的响应头
```html
<!--允许任意域名下的网页跨域访问-->
<meta http-equiv="Access-Control-Allow-Origin" content="*">
```

## 5. ajax请求二进制文件
处理二进制文件主要使用的是H5的FileReader

### 5.1 ajax请求二进制图片并预览
```javascript
var xhr = new XMLHttpRequest(),
    url = "https://user-gold-cdn.xitu.io/2017/3/15/c6eacd7c2f4307f34cd45e93885d1cb6.png";
xhr.open("GET", url);
xhr.responseType = "blob";
xhr.onload = function(){
  if(this.status == 200){
    var blob = this.response;
    var img = document.createElement("img");
    //方案一
    img.src = window.URL.createObjectURL(blob);//这里blob依然占据着内存
    img.onload = function() {
      window.URL.revokeObjectURL(img.src);//释放内存
    };
    //方案二
    /*var reader = new FileReader();
    reader.readAsDataURL(blob);//FileReader将返回base64编码的data-uri对象
    reader.onload = function(){
      img.src = this.result;
    }*/
    //方案三
    //img.src = url;//最简单方法
    document.body.appendChild(img);
  }
}
xhr.send();
```

### 5.2 ajax请求二进制文本并展示
```javascript
var xhr = new XMLHttpRequest();
xhr.open("GET","http://localhost:8080/Information/download.jsp?data=node-fetch.js");
xhr.responseType = "blob";
xhr.onload = function(){
  if(this.status == 200){
    var blob = this.response;
    var reader = new FileReader();
    reader.readAsText(blob);//该方法已被移出标准api,建议使用reader.readAsText(blob);
    reader.onload=function(){
      document.body.innerHTML = "<div>" + this.result + "</div>";
    }
  }
}
xhr.send();
```

## 6.fetch
缺点：
1. 需要手动将参数拼接
2. fetch不支持超时
3. 没有提供abort方法
4. 数据只能取一次

## 参考
[Ajax 知识体系大梳理
](https://juejin.im/post/58c883ecb123db005311861a#heading-30)
