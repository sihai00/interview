# PWA
渐进式网页应用 = CacheStorage + Service worker
- 安全（HTTPS）。
- 可在离线或网络较差的环境下正常打开页面。
- 保持最新（及时更新）。
- 支持安装（添加到主屏幕）和消息推送。
- 向下兼容，在不支持相关技术的浏览器中仍可正常访问。

## 1.CacheStorage
CacheStorage是一种新的本地存储。每个域有若干个存储模块，每个模块内可以存储若干个键值对。 它的键是网络请求（Request），值是请求对应的响应（Response）
- caches.open：打开存储模块
- caches.put：添加缓存
- cache.addAll：添加缓存数组
- caches.match：匹配资源
- caches.delete：删除资源

```js
if (typeof 'caches' !== 'undefined') {
    // 要缓存资源的URL
    const URL = 'https://s3.imgbeiliao.com/assets/imgs/icons/app/1.0.0/parent-192x192.png';
    // 存储模块名
    const CACHE_KEY = 'v1';

    fetch(URL, {
        mode: 'no-cors'
    }).then((response) => {
        // 打开存储模块后往里面添加缓存
        caches.open(CACHE_KEY).then((cache) => {
            cache.put(url, response);
        });
    });
}
```
```js
// 在所有存储模块中匹配资源
caches.match(URL).then((response) => {
    console.log(response);
});

// 在单个存储模块中匹配资源
caches.open(CACHE_KEY).then((cache) => {
    cache.match(URL).then((response) => {
        console.log(response);
    });
});
```
```js
// 删除整个存储模块
caches.delete(CACHE_KEY).then((flag) => {
    console.log(flag);
});

// 删除存储模块中的某个存储项
caches.open(CACHE_KEY).then((cache) => {
    if (cache) {
        cache.delete(url).then((flag) => {
            console.log(flag)
        });
    }
});
```

## 2.Service worker
特点：
- 基于https
- 多线程，会开辟新的内存空间
- 可多页面共享

流程：
1. 注册
2. 安装
3. 请求
3. 更新

### 2.1 注册
SW 的作用域不同，监听的 fetch 请求也是不一样的。
例如，我们将注册路由换成: /example/sw.js，那么SW 后面只会监听 /example 路由下的所有 fetch 请求，而不会去监听其他，比如 /jimmy,/sam 等路径下的。
```js
if ('serviceWorker' in navigator) {
  window.addEventListener('DOMContentLoaded', function() {
    // 执行注册
    navigator.serviceWorker.register('/sw.js').then(function(registration) {

    }).catch(function(err) {

    }); 
  });
}
``` 

### 2.2 安装
- 缓存文件
```js
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('mysite-static-v1').then(function(cache) {
      return cache.addAll([
        '/css/whatever-v3.css',
        '/css/imgs/sprites-v6.png',
        '/css/fonts/whatever-v8.woff',
        '/js/all-min-v4.js'
      ]);
    })
  );
});
```

### 2.3 请求
- 拦截：查找缓存资源是否存在
    - 存在：返回缓存资源
    - 不存在：请求，然后缓存资源
```js
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }

        // 因为 event.request 流已经在 caches.match 中使用过一次，
        // 那么该流是不能再次使用的。我们只能得到它的副本，拿去使用。
        var fetchRequest = event.request.clone();

        // fetch 的通过信方式，得到 Request 对象，然后发送请求
        return fetch(fetchRequest).then(
          function(response) {
            // 检查是否成功
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 如果成功，该 response 一是要拿给浏览器渲染，二是要进行缓存。
            // 不过需要记住，由于 caches.put 使用的是文件的响应流，一旦使用，
            // 那么返回的 response 就无法访问造成失败，所以，这里需要复制一份。
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});
```

### 2.4 更新
- SW更新
    1. 新的SW.js 文件下载，触发install事件
    2. 旧的 SW 还在工作，新的 SW 进入 waiting 状态
    3. 当打开的页面关闭时，旧的 SW 则会被 kill 掉。新的 SW 就开始接管页面的缓存资源
    4. 一旦新的 SW 接管，则会触发 activate 事件（***注意：以前版本 SW.js 缓存文件没有被删除，可以在此阶段执行删除***）
- 资源更新

```js
// SW更新，在activate删除旧的缓存资源
self.addEventListener('activate', function(event) {
  var cacheWhitelist = ['site-v1'];
  event.waitUntil(
  // 遍历 caches 里所有缓存的 keys 值
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.includes(cacheName)) {
          // 删除 v1 版本缓存的文件
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

```js
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('mysite-static-v1').then(function(cache) {
      return cache.addAll([
        '/css/whatever-v3.css',
        '/css/imgs/sprites-v6.png',
        '/css/fonts/whatever-v8.woff',
        '/js/all-min-v4.js'
      ]);
    })
  );
});

// install的时候更新
self.addEventListener('install', function(event) {
  var now = Date.now();
  // 事先设置好需要进行更新的文件路径
  var urlsToPrefetch = [
    'static/pre_fetched.txt',
    'static/pre_fetched.html',
    'https://www.chromium.org/_/rsrc/1302286216006/config/customLogo.gif'
  ];

  event.waitUntil(
    caches.open(CURRENT_CACHES.prefetch).then(function(cache) {
      var cachePromises = urlsToPrefetch.map(function(urlToPrefetch) {
      // 使用 url 对象进行路由拼接
        var url = new URL(urlToPrefetch, location.href);
        url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
        // 创建 request 对象进行流量的获取
        var request = new Request(url, {mode: 'no-cors'});
        // 手动发送请求，用来进行文件的更新
        return fetch(request).then(function(response) {
          if (response.status >= 400) {
            // 解决请求失败时的情况
            throw new Error('request for ' + urlToPrefetch +
              ' failed with status ' + response.statusText);
          }
          // 将成功后的 response 流，存放在 caches 套件中，完成指定文件的更新。
          return cache.put(urlToPrefetch, response);
        }).catch(function(error) {
          console.error('Not caching ' + urlToPrefetch + ' due to ' + error);
        });
      });

      return Promise.all(cachePromises).then(function() {
        console.log('Pre-fetching complete.');
      });
    }).catch(function(error) {
      console.error('Pre-fetching failed:', error);
    })
  );
});

// 安装的时候更新
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open('mysite-dynamic').then(function(cache) {
      return cache.match(event.request).then(function(response) {
        var fetchPromise = fetch(event.request).then(function(networkResponse) {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        })
        return response || fetchPromise;
      })
    })
  );
});
```

## 参考
- [Service Worker 全面进阶](https://juejin.im/post/591028fc2f301e006c291c4b#heading-6)
