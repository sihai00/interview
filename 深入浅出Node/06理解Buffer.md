# 理解Buffer

Buffer所占用的内存不是通过V8分配的，属于堆外内存

## Buffer不支持的编码类型
- iconv-lite：纯JavaScript实现
- iconv：C++调用libiconv库完成
```javascript
// 字符串 -> buffer
new Buffer(str, [encoding]);

// buffer -> 字符串
buf.toString([encoding], [start], [end])

// 判断编码类型
Buffer.isEncoding(encoding)
```

## Buffer的拼接
### 拼接方式一
问题：Buffer对象的长度为11，中文由三个字节组成一个字符，所以`11 % 3 = 2`剩下的两个字节无法识别
```javascript
var fs = require('fs');

var rs = fs.createReadStream('test.md');
var data = '';
rs.on("data", function (chunk) {
  // 会导致乱码
  // 相当于 data = data.toString() + chunk.toString();
  data += chunk;
});
rs.on("end", function () {
  console.log(data);
});
```

解决：
可通过设置编码方式`readable.setEncoding(encoding)`解决，原理：
- 得知编码方式
- 保留剩下无法识别的字节
- 与下回开头的字节结合识别

### 拼接方法二
```javascript
var chunks = [];
var size = 0;
res.on('data', function (chunk) {
  chunks.push(chunk);
  size += chunk.length;
});
res.on('end', function () {
  var buf = Buffer.concat(chunks, size);
  var str = iconv.decode(buf, 'utf8');
  console.log(str);
});
```

## Buffer与性能
- 文件传输：预先转换静态内容为Buffer对象，可以有效地减少CPU的重复使用，节省服务器资源
- 文件读取：
  - fs.createReadStream()的工作方式是在内存中准备一段Buffer
  - 在fs.read()读取时逐步从磁盘中将字节复制到Buffer中（每次读取的长度就是用户指定的highWaterMark）
  - 完成一次读取时，则从这个Buffer中通过slice()方法取出部分数据作为一个小Buffer对象，再通过data事件传递给调用方。
  - 如果Buffer用完，则重新分配一个；如果还有剩余，则继续使用