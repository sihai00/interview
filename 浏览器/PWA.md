# PWA
渐进式网页应用 = CacheStorage + Service worker
- 安全（HTTPS）。
- 可在离线或网络较差的环境下正常打开页面。
- 保持最新（及时更新）。
- 支持安装（添加到主屏幕）和消息推送。
- 向下兼容，在不支持相关技术的浏览器中仍可正常访问。

## CacheStorage
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

## Service worker
