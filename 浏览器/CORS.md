## CORS
跨域资源共享：它允许浏览器向跨源服务器，发出XMLHttpRequest请求，从而克服了AJAX只能同源使用的限制
前提：CORS需要浏览器和服务器同时支持。
浏览器一旦发现AJAX请求跨源，就会自动添加一些附加的头信息，有时还会多出一次附加的请求，但用户不会有感觉。只要服务器实现了CORS接口，就可以跨源通信

## 两种请求
- 简单请求
    - 请求方法是以下三种方法之一
        - GET
        - POST
        - HEAD
    - HTTP的头信息不超出以下几种字段
        - Accept：请求头用来告知（服务器）客户端可以处理的内容类型
        - Accept-Language：请求头允许客户端声明它可以理解的自然语言
        - Content-Type：只限于三个值application/x-www-form-urlencoded、multipart/form-data、text/plain
        - Content-Language：用来说明访问者希望采用的语言或语言组合
        - Last-Event-ID
- 非简单请求

## 简单请求
1. 浏览器：在头信息之中，增加一个Origin字段，表示本次请求来自哪个源（协议 + 域名 + 端口）。服务器根据这个值，决定是否同意这次请求。
2. 服务器：判断 Origin 是否在指定的许可范围
    - 不在：抛出一个错误，被XMLHttpRequest的onerror回调函数捕获
    - 在：服务器返回的响应，会多出几个头信息字段
        - Access-Control-Allow-Origin：请求时Origin字段的值或者是一个*，表示接受任意域名的请求
        - Access-Control-Allow-Credentials：是否允许发送Cookie
            - Access-Control-Allow-Origin必须指定明确的、与请求网页一致的域名
            - 开发者必须在AJAX请求中打开withCredentials属性：`xhr.withCredentials = true`
            - 服务器：`Access-Control-Allow-Credentials: true`
        - Access-Control-Allow-Methods：它的值是逗号分隔的一个字符串，表明服务器支持的所有跨域请求的方法。例如：`Access-Control-Allow-Methods: GET, POST, PUT`
        - Access-Control-Allow-Headers：如果浏览器请求包括Access-Control-Request-Headers字段，则Access-Control-Allow-Headers字段是必需的
        - Access-Control-Max-Age：该字段可选，用来指定本次预检请求的有效期，单位为秒
        - Access-Control-Expose-Headers：额外的头信息，不包括
              - Cache-Control
              - Content-Language
              - Content-Type
              - Expires
              - Last-Modified
              - Pragma
## 非简单请求
两次请求
1. 预检请求(method：option)：当前网页所在的域名是否在服务器的许可名单之中，以及可以使用哪些HTTP动词和头信息字段
    - Access-Control-Request-Method：列出浏览器的CORS请求会用到哪些HTTP方法
    - Access-Control-Request-Headers：指定浏览器CORS请求会额外发送的头信息字段
2. 正常请求：
    - Origin字段

```javascript
var url = 'http://api.alice.com/cors';
var xhr = new XMLHttpRequest();
xhr.open('PUT', url, true);
xhr.setRequestHeader('X-Custom-Header', 'value');
xhr.send();

// 预检请求HTTP头信息
// OPTIONS /cors HTTP/1.1
// Origin: http://api.bob.com
// Access-Control-Request-Method: PUT
// Access-Control-Request-Headers: X-Custom-Header
// Host: api.alice.com
// Accept-Language: en-US
// Connection: keep-alive
// User-Agent: Mozilla/5.0...

// 预检请求的回应
// HTTP/1.1 200 OK
// Date: Mon, 01 Dec 2008 01:15:39 GMT
// Server: Apache/2.0.61 (Unix)
// Access-Control-Allow-Origin: http://api.bob.com
// Access-Control-Allow-Methods: GET, POST, PUT
// Access-Control-Allow-Headers: X-Custom-Header
// Content-Type: text/html; charset=utf-8
// Content-Encoding: gzip
// Content-Length: 0
// Keep-Alive: timeout=2, max=100
// Connection: Keep-Alive
// Content-Type: text/plain
```

## 与JSONP的比较
CORS与JSONP的使用目的相同，但是比JSONP更强大。
- JSONP只支持GET请求。JSONP的优势在于支持老式浏览器，以及可以向不支持CORS的网站请求数据。
- CORS支持所有类型的HTTP请求。

## 参考
- [跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html)


