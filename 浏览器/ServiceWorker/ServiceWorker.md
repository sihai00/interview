# service worker
功能：
- 网络代理
- 离线缓存
- 消息推送

生命周期：
installing：这个状态发生在service worker注册之后，表示开始安装。在这个过程会触发install事件回调指定一些静态资源进行离线缓存。
installed：sw已经完成了安装，进入了waiting状态，等待其他的Service worker被关闭（在install的事件回调中，可以调用skipWaiting方法来跳过waiting这个阶段）
activating： 在这个状态下没有被其他的 Service Worker 控制的客户端，允许当前的 worker 完成安装，并且清除了其他的 worker 以及关联缓存的旧缓存资源，等待新的 Service Worker 线程被激活。
activated： 在这个状态会处理activate事件回调，并提供处理功能性事件：fetch、sync、push。（在acitive的事件回调中，可以调用self.clients.claim()）
redundant：废弃状态，这个状态表示一个sw的使命周期结束

主要事件：
- install：顾名思义，Service Worker安装时触发，通常在这个时机缓存文件
- activate：顾名思义，Service Worker激活时触发，通常在这个时机做一些重置的操作，例如处理旧版本Service Worker的缓存
- fetch：顾名思义，浏览器发起HTTP请求时触发，通常在这个事件的回调函数中匹配缓存，是最常用的事件
- push：顾名思义，和推送通知功能相关，没有相关需求的话可以不去了解
- sync：顾名思义，和后台同步功能相关，没有相关需求的话可以不去了解

## 代码
```javascript
//在页面代码里面监听onload事件，使用sw的配置文件注册一个service worker
 if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('serviceWorker.js')
            .then(function (registration) {
                // 注册成功
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(function (err) {
                // 注册失败
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
```
```javascript
//serviceWorker.js
var CACHE_NAME = 'my-first-sw';
var urlsToCache = [
    '/',
    '/styles/main.css',
    '/script/main.js'
];

self.addEventListener('install', function(event) {
    // 在install阶段里可以预缓存一些资源
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

//在fetch事件里能拦截网络请求，进行一些处理
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            // 如果匹配到缓存里的资源，则直接返回
            if (response) {
                return response;
            }
          
            // 匹配失败则继续请求
            var request = event.request.clone(); // 把原始请求拷过来

            //默认情况下，从不支持 CORS 的第三方网址中获取资源将会失败。
            // 您可以向请求中添加 no-CORS 选项来克服此问题，不过这可能会导致“不透明”的响应，这意味着您无法辨别响应是否成功。
            if (request.mode !== 'navigate' && request.url.indexOf(request.referrer) === -1) 						{
                request = new Request(request, { mode: 'no-cors' })
            }

            return fetch(request).then(function (httpRes) {
								//拿到了http请求返回的数据，进行一些操作
              
              	//请求失败了则直接返回、对于post请求也直接返回，sw不能缓存post请求
                if (!httpRes  || ( httpRes.status !== 200 && httpRes.status !== 304 && httpRes.type !== 'opaque') || request.method === 'POST') {
                    return httpRes;
                }

                // 请求成功的话，将请求缓存起来。
                var responseClone = httpRes.clone();
                caches.open('my-first-sw').then(function (cache) {
                    cache.put(event.request, responseClone);
                });

                return httpRes;
            });
        })
    );
});
```
## 参考
- [Service Worker离线缓存实践](https://juejin.im/post/5d47f5c45188255d2a78af38)
- [Service Worker 从入门到出门](https://juejin.im/post/5d26aec1f265da1ba56b47ea)
