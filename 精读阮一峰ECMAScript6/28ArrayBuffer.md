# ArrayBuffer
ArrayBuffer对象、TypedArray视图和DataView视图是 JavaScript 操作二进制数据的一个接口，以数组的语法处理二进制数据，所以统称为二进制数组。

- ArrayBuffer对象：代表原始的二进制数据
- TypedArray视图：用来读写简单类型的二进制数据
- DataView视图：用来读写复杂类型的二进制数据

注意，二进制数组并不是真正的数组，而是类似数组的对象

## 1.ArrayBuffer 对象
1. 原始内存的ArrayBuffer对象，默认所有位都是 0
2. DataView视图是一个构造函数
3. TypedArray视图是一组构造函数，代表不同的数据格式（可以接受普通数组作为参数，直接分配内存生成底层的ArrayBuffer实例，并同时完成对这段内存的赋值）

### 1.1 概述
```javascript
const buf = new ArrayBuffer(32);
const dataView = new DataView(buf);
dataView.getUint8(0) // 0
```
```javascript
const buffer = new ArrayBuffer(12);

const x1 = new Int32Array(buffer);
x1[0] = 1;
const x2 = new Uint8Array(buffer);
x2[0]  = 2;

x1[0] // 2

const typedArray = new Uint8Array([0,1,2]);
typedArray.length // 3
typedArray[0] = 5;
typedArray // [5, 1, 2]
```

### 1.2 ArrayBuffer.prototype.byteLength
ArrayBuffer实例的byteLength属性，返回所分配的内存区域的字节长度。
```javascript
const buffer = new ArrayBuffer(32);
buffer.byteLength
// 32
```

### 1.3 ArrayBuffer.prototype.slice()
ArrayBuffer实例有一个slice方法，允许将内存区域的一部分，拷贝生成一个新的ArrayBuffer对象。
```javascript
const buffer = new ArrayBuffer(8);
const newBuffer = buffer.slice(0, 3);
```

### 1.4 ArrayBuffer.isView
ArrayBuffer有一个静态方法isView，返回一个布尔值，表示参数是否为ArrayBuffer的视图实例
```javascript
const buffer = new ArrayBuffer(8);
ArrayBuffer.isView(buffer) // false

const v = new Int32Array(buffer);
ArrayBuffer.isView(v) // true
```

## 2.TypedArray 视图
### 2.1 概述
TypedArray视图一共包括 9 种类型，每一种视图都是一种构造函数
- Int8Array：8 位有符号整数，长度 1 个字节。
- Uint8Array：8 位无符号整数，长度 1 个字节。
- Uint8ClampedArray：8 位无符号整数，长度 1 个字节，溢出处理不同。
- Int16Array：16 位有符号整数，长度 2 个字节。
- Uint16Array：16 位无符号整数，长度 2 个字节。
- Int32Array：32 位有符号整数，长度 4 个字节。
- Uint32Array：32 位无符号整数，长度 4 个字节。
- Float32Array：32 位浮点数，长度 4 个字节。
- Float64Array：64 位浮点数，长度 8 个字节。

普通数组与 TypedArray 数组的差异
- TypedArray 数组的所有成员，都是同一种类型。
- TypedArray 数组的成员是连续的，不会有空位。
- TypedArray 数组成员的默认值为 0。比如，new Array(10)返回一个普通数组，里面没有任何成员，只是 10 个空位；new Uint8Array(10)返回一个 TypedArray 数组，里面 10 个成员都是 0。
- TypedArray 数组只是一层视图，本身不储存数据，它的数据都储存在底层的ArrayBuffer对象之中，要获取底层对象必须使用buffer属性。

### 2.2 构造函数
1. TypedArray(buffer, byteOffset=0, length?)
byteOffset必须与所要建立的数据类型一致，否则会报错
```javascript
const buffer = new ArrayBuffer(8);
const i16 = new Int16Array(buffer, 1);
// Uncaught RangeError: start offset of Int16Array should be a multiple of 2
```

2. TypedArray(length)
视图还可以不通过ArrayBuffer对象，直接分配内存而生成。
- length：成员数量

```javascript
const f64a = new Float64Array(8);
f64a[0] = 10;
f64a[1] = 20;
f64a[2] = f64a[0] + f64a[1];
```

3. TypedArray(typedArray)
TypedArray 数组的构造函数，可以接受另一个TypedArray实例作为参数。
此时生成的新数组，只是复制了参数数组的值，对应的底层内存是不一样的。新数组会开辟一段新的内存储存数据，不会在原数组的内存之上建立视图。
```javascript
const x = new Int8Array([1, 1]);
const y = new Int8Array(x);
x[0] // 1
y[0] // 1

x[0] = 2;
y[0] // 1
```
如果想基于同一段内存，构造不同的视图，可以采用下面的写法。
```javascript
const x = new Int8Array([1, 1]);
const y = new Int8Array(x.buffer);
x[0] // 1
y[0] // 1

x[0] = 2;
y[0] // 2
```
4. TypedArray(arrayLikeObject)
构造函数的参数也可以是一个普通数组，然后直接生成TypedArray实例。
```javascript
const typedArray = new Uint8Array([1, 2, 3, 4]);

// TypedArray 数组也可以转换回普通数组。
const normalArray = [...typedArray];
// or
const normalArray = Array.from(typedArray);
// or
const normalArray = Array.prototype.slice.call(typedArray);
```

### 2.3 字节序
字节序指的是数值在内存中的表示方式。
```javascript
// 假定某段buffer包含如下字节 [0x02, 0x01, 0x03, 0x07]
const buffer = new ArrayBuffer(4);
const v1 = new Uint8Array(buffer);
v1[0] = 2;
v1[1] = 1;
v1[2] = 3;
v1[3] = 7;

const uInt16View = new Uint16Array(buffer);

// 计算机采用小端字节序
// 所以头两个字节等于258
if (uInt16View[0] === 258) {
  console.log('OK'); // "OK"
}

// 赋值运算
uInt16View[0] = 255;    // 字节变为[0xFF, 0x00, 0x03, 0x07]
uInt16View[0] = 0xff05; // 字节变为[0x05, 0xFF, 0x03, 0x07]
uInt16View[1] = 0x0210; // 字节变为[0x05, 0xFF, 0x10, 0x02]
```
比如，一个占据四个字节的 16 进制数0x12345678，决定其大小的最重要的字节是“12”，最不重要的是“78”。
小端字节序将最不重要的字节排在前面，储存顺序就是78563412；大端字节序则完全相反，将最重要的字节排在前面，储存顺序就是12345678。
目前，所有个人电脑几乎都是小端字节序，所以 TypedArray 数组内部也采用小端字节序读写数据，或者更准确的说，按照本机操作系统设定的字节序读写数据。

### 2.4 BYTES_PER_ELEMENT 属性 
```javascript
Int8Array.BYTES_PER_ELEMENT // 1
Uint8Array.BYTES_PER_ELEMENT // 1
Uint8ClampedArray.BYTES_PER_ELEMENT // 1
Int16Array.BYTES_PER_ELEMENT // 2
Uint16Array.BYTES_PER_ELEMENT // 2
Int32Array.BYTES_PER_ELEMENT // 4
Uint32Array.BYTES_PER_ELEMENT // 4
Float32Array.BYTES_PER_ELEMENT // 4
Float64Array.BYTES_PER_ELEMENT // 8
```

### 2.5 ArrayBuffer 与字符串的互相转换
ArrayBuffer 和字符串的相互转换，使用原生 TextEncoder 和 TextDecoder 方法
[Node文档](https://nodejs.org/api/util.html#util_whatwg_supported_encodings)

### 2.6 溢出
抛弃溢出的位，然后按照视图类型进行解释
- 负数在计算机内部采用“2 的补码”表示，也就是说，将对应的正数值进行否运算，然后加1。
```javascript
const uint8 = new Uint8Array(1);

// 256 的二进制形式是一个 9 位的值100000000，这时就会发生溢出。根据规则，只会保留后 8 位，即00000000
uint8[0] = 256;
uint8[0] // 0

// -1对应的正值是1，进行否运算以后，得到11111110，再加上1就是补码形式11111111。uint8按照无符号的 8 位整数解释11111111，返回结果就是255
uint8[0] = -1;
uint8[0] // 255
```
简单转换规则，可以这样表示。
- 正向溢出（overflow）：当输入值大于当前数据类型的最大值，结果等于当前数据类型的最小值加上余值，再减去 1。
- 负向溢出（underflow）：当输入值小于当前数据类型的最小值，结果等于当前数据类型的最大值减去余值的绝对值，再加上 1。

```javascript
const int8 = new Int8Array(1);

// int8是一个带符号的 8 位整数视图，它的最大值是 127，最小值是-128。
// 输入值为128时，相当于正向溢出1，根据“最小值加上余值（128 除以 127 的余值是 1），再减去 1”的规则，就会返回-128
int8[0] = 128;
int8[0] // -128

// 输入值为-129时，相当于负向溢出1，根据“最大值减去余值的绝对值（-129 除以-128 的余值的绝对值是 1），再加上 1”的规则，就会返回127。
int8[0] = -129;
int8[0] // 127
```
Uint8ClampedArray视图的溢出规则，与上面的规则不同。
- 发生正向溢出，该值一律等于当前数据类型的最大值，即 255
- 发生负向溢出，该值一律等于当前数据类型的最小值，即 0
```javascript
const uint8c = new Uint8ClampedArray(1);

uint8c[0] = 256;
uint8c[0] // 255

uint8c[0] = -1;
uint8c[0] // 0
```

### 2.7 TypedArray.prototype.buffer
TypedArray实例的buffer属性，返回整段内存区域对应的ArrayBuffer对象。该属性为只读属性。

### 2.8 TypedArray.prototype.byteLength，TypedArray.prototype.byteOffset
- byteLength属性：返回 TypedArray 数组占据的内存长度，单位为字节。
- byteOffset属性：返回 TypedArray 数组从底层ArrayBuffer对象的哪个字节开始。这两个属性都是只读属性。
```javascript
const b = new ArrayBuffer(8);

const v1 = new Int32Array(b);
const v2 = new Uint8Array(b, 2);
const v3 = new Int16Array(b, 2, 2);

v1.byteLength // 8
v2.byteLength // 6
v3.byteLength // 4

v1.byteOffset // 0
v2.byteOffset // 2
v3.byteOffset // 2
```

### 2.9 TypedArray.prototype.length
length属性表示 TypedArray 数组含有多少个成员。
- length：成员长度
- byteLength：字节长度
```javascript
const a = new Int16Array(8);

a.length // 8
a.byteLength // 16
```

### 2.10 TypedArray.prototype.set()
TypedArray 数组的set方法用于复制数组（普通数组或 TypedArray 数组），也就是将一段内容完全复制到另一段内存。

```javascript
const a = new Uint16Array(8);
const b = new Uint16Array(10);

// 从b[2]开始复制
b.set(a, 2)
```

### 2.11 TypedArray.prototype.subarray()
subarray方法是对于 TypedArray 数组的一部分，再建立一个新的视图。

```javascript
const a = new Uint16Array(8);
const b = a.subarray(2,3);

a.byteLength // 16
b.byteLength // 2
```

### 2.12 TypedArray.prototype.slice()
TypeArray 实例的slice方法，可以返回一个指定位置的新的TypedArray实例。

```javascript
let ui8 = Uint8Array.of(0, 1, 2);
ui8.slice(-1)
// Uint8Array [ 2 ]
```

### 2.13 TypedArray.of()
TypedArray 数组的所有构造函数，都有一个静态方法of，用于将参数转为一个TypedArray实例。
下面三种方法都会生成同样一个 TypedArray 数组。
```javascript
// 方法一
let tarr = new Uint8Array([1,2,3]);

// 方法二
let tarr = Uint8Array.of(1,2,3);

// 方法三
let tarr = new Uint8Array(3);
tarr[0] = 1;
tarr[1] = 2;
tarr[2] = 3;
```

### 2.14 TypedArray.from()
静态方法from接受一个可遍历的数据结构（比如数组）作为参数，返回一个基于这个结构的TypedArray实例。
```javascript
Int8Array.of(127, 126, 125).map(x => 2 * x)
// Int8Array [ -2, -4, -6 ]

// from会将第一个参数指定的 TypedArray 数组，拷贝到另一段内存之中，处理之后再将结果转成指定的数组格式。
Int16Array.from(Int8Array.of(127, 126, 125), x => 2 * x)
// Int16Array [ 254, 252, 250 ]
```

## 3.复合视图
由于视图的构造函数可以指定起始位置和长度，所以在同一段内存之中，可以依次存放不同类型的数据，这叫做“复合视图”。
```javascript
const buffer = new ArrayBuffer(24);

const idView = new Uint32Array(buffer, 0, 1);
const usernameView = new Uint8Array(buffer, 4, 16);
const amountDueView = new Float32Array(buffer, 20, 1);
```
上面代码将一个 24 字节长度的ArrayBuffer对象，分成三个部分：

1. 字节 0 到字节 3：1 个 32 位无符号整数
2. 字节 4 到字节 19：16 个 8 位整数
3. 字节 20 到字节 23：1 个 32 位浮点数

## 4.DataView 视图
DataView实例有以下属性，含义与TypedArray实例的同名方法相同：
- DataView.prototype.buffer：返回对应的 ArrayBuffer 对象
- DataView.prototype.byteLength：返回占据的内存字节长度
- DataView.prototype.byteOffset：返回当前视图从对应的 ArrayBuffer 对象的哪个字节开始

DataView实例提供 8 个方法读取内存：
- getInt8：读取 1 个字节，返回一个 8 位整数。
- getUint8：读取 1 个字节，返回一个无符号的 8 位整数。
- getInt16：读取 2 个字节，返回一个 16 位整数。
- getUint16：读取 2 个字节，返回一个无符号的 16 位整数。
- getInt32：读取 4 个字节，返回一个 32 位整数。
- getUint32：读取 4 个字节，返回一个无符号的 32 位整数。
- getFloat32：读取 4 个字节，返回一个 32 位浮点数。
- getFloat64：读取 8 个字节，返回一个 64 位浮点数。

DataView 视图提供 8 个方法写入内存：
- setInt8：写入 1 个字节的 8 位整数。
- setUint8：写入 1 个字节的 8 位无符号整数。
- setInt16：写入 2 个字节的 16 位整数。
- setUint16：写入 2 个字节的 16 位无符号整数。
- setInt32：写入 4 个字节的 32 位整数。
- setUint32：写入 4 个字节的 32 位无符号整数。
- setFloat32：写入 4 个字节的 32 位浮点数。
- setFloat64：写入 8 个字节的 64 位浮点数。

```javascript
const buffer = new ArrayBuffer(24);
const dv = new DataView(buffer);

// 从第1个字节读取一个8位无符号整数
const v1 = dv.getUint8(0);

// 从第2个字节读取一个16位无符号整数
const v2 = dv.getUint16(1);

// 从第4个字节读取一个16位无符号整数
const v3 = dv.getUint16(3);

// 小端字节序
const v1 = dv.getUint16(1, true);

// 大端字节序
const v2 = dv.getUint16(3, false);

// 大端字节序
const v3 = dv.getUint16(3);

// 在第1个字节，以大端字节序写入值为25的32位整数
dv.setInt32(0, 25, false);

// 在第5个字节，以大端字节序写入值为25的32位整数
dv.setInt32(4, 25);

// 在第9个字节，以小端字节序写入值为2.5的32位浮点数
dv.setFloat32(8, 2.5, true);
```

## 5.二进制数组的应用
### 5.1 AJAX
XMLHttpRequest第二版XHR2允许服务器返回二进制数据
```javascript
let xhr = new XMLHttpRequest();
xhr.open('GET', someUrl);
xhr.responseType = 'arraybuffer';

xhr.onload = function () {
  let arrayBuffer = xhr.response;
  // ···
};

xhr.send();
```

### 5.2 Canvas
Uint8ClampedArray视图类型的特点，就是专门针对颜色，把每个字节解读为无符号的 8 位整数，即只能取值 0 ～ 255，而且发生运算的时候自动过滤高位溢出
```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const uint8ClampedArray = imageData.data;
```

### 5.3 WebSocket
WebSocket可以通过ArrayBuffer，发送或接收二进制数据。
```javascript
let socket = new WebSocket('ws://127.0.0.1:8081');
socket.binaryType = 'arraybuffer';

// Wait until socket is open
socket.addEventListener('open', function (event) {
  // Send binary data
  const typedArray = new Uint8Array(4);
  socket.send(typedArray.buffer);
});

// Receive binary data
socket.addEventListener('message', function (event) {
  const arrayBuffer = event.data;
  // ···
});
``` 

### 5.4 Fetch API
Fetch API 取回的数据，就是ArrayBuffer对象。
```javascript
fetch(url)
.then(function(response){
  return response.arrayBuffer()
})
.then(function(arrayBuffer){
  // ...
});
```

### 5.5 File API
如果知道一个文件的二进制数据类型，也可以将这个文件读取为ArrayBuffer对象。
```javascript
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const reader = new FileReader();
reader.readAsArrayBuffer(file);
reader.onload = function () {
  const arrayBuffer = reader.result;
  // ···
};
```

### 5.6 SharedArrayBuffer
JavaScript 是单线程的，Web worker 引入了多线程：主线程用来与用户互动，Worker 线程用来承担计算任务。每个线程的数据都是隔离的，通过postMessage()通信。
> 线程之间的数据交换可以是各种格式，不仅仅是字符串，也可以是二进制数据。
> 这种交换采用的是复制机制，即一个进程将需要分享的数据复制一份，通过postMessage方法交给另一个进程。
> 如果数据量比较大，这种通信的效率显然比较低。很容易想到，这时可以留出一块内存区域，由主线程与 Worker 线程共享，两方都可以读写，那么就会大大提高效率，协作起来也会比较简单

ES2017 引入SharedArrayBuffer，允许 Worker 线程与主线程共享同一块内存。
SharedArrayBuffer的 API 与ArrayBuffer一模一样，唯一的区别是后者无法共享数据。
```javascript
// 主线程

// 新建 1KB 共享内存
const sharedBuffer = new SharedArrayBuffer(1024);

// 主线程将共享内存的地址发送出去
w.postMessage(sharedBuffer);

// 在共享内存上建立视图，供写入数据
const sharedArray = new Int32Array(sharedBuffer);
```
```javascript
// Worker 线程
onmessage = function (ev) {
  // 主线程共享的数据，就是 1KB 的共享内存
  const sharedBuffer = ev.data;

  // 在共享内存上建立视图，方便读写
  const sharedArray = new Int32Array(sharedBuffer);

  // ...
};
```

### 5.7 Atomics 对象
它可以保证一个操作所对应的多条机器指令，一定是作为一个整体运行的，中间不会被打断（解决问题例如：两个线程同时修改某个地址）
```javascript
// 主线程
const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 100000);
const ia = new Int32Array(sab);

for (let i = 0; i < ia.length; i++) {
  ia[i] = primes.next(); // 将质数放入 ia
}

// worker 线程
ia[112]++; // 错误
Atomics.add(ia, 112, 1); // 正确
```

#### 5.7.1 Atomics.store()，Atomics.load()
- store()方法用来向共享内存写入数据
- load()方法用来从共享内存读出数据

```javascript
// 主线程 main.js
ia[42] = 314159;  // 原先的值 191
Atomics.store(ia, 37, 123456);  // 原先的值是 163

// Worker 线程 worker.js
while (Atomics.load(ia, 37) == 163);
console.log(ia[37]);  // 123456
console.log(ia[42]);  // 314159
```

#### 5.7.2 Atomics.exchange()
写入数据
- Atomics.store()返回写入的值
- Atomics.exchange()返回被替换的值

#### 5.7.3 Atomics.wait()，Atomics.wake()
使用while循环等待主线程的通知，不是很高效，如果用在主线程，就会造成卡顿，Atomics对象提供了wait()和wake()两个方法用于等待通知
这两个方法相当于锁内存，即在一个线程进行操作时，让其他线程休眠（建立锁），等到操作结束，再唤醒那些休眠的线程（解除锁）
```javascript
// 主线程
console.log(ia[37]);  // 163
Atomics.store(ia, 37, 123456);
Atomics.wake(ia, 37, 1);

// Worker 线程
Atomics.wait(ia, 37, 163);
console.log(ia[37]);  // 123456

// 视图数组ia的第 37 号位置，原来的值是163。
// Worker 线程使用Atomics.wait()方法，指定只要ia[37]等于163，就进入休眠状态。
// 主线程使用Atomics.store()方法，将123456写入ia[37]，然后使用Atomics.wake()方法唤醒 Worker 线程。
```

#### 5.7.4 运算方法
共享内存上面的某些运算是不能被打断的，即不能在运算过程中，让其他线程改写内存上面的值。
- Atomics.add(sharedArray, index, value)：Atomics.add用于将value加到sharedArray[index]，返回sharedArray[index]旧的值。
- Atomics.sub(sharedArray, index, value)：Atomics.sub用于将value从sharedArray[index]减去，返回sharedArray[index]旧的值。
- Atomics.and(sharedArray, index, value)：Atomics.and用于将value与sharedArray[index]进行位运算and，放入sharedArray[index]，并返回旧的值。
- Atomics.or(sharedArray, index, value)：Atomics.or用于将value与sharedArray[index]进行位运算or，放入sharedArray[index]，并返回旧的值。
- Atomics.xor(sharedArray, index, value)：Atomic.xor用于将vaule与sharedArray[index]进行位运算xor，放入sharedArray[index]，并返回旧的值。
                                         
#### 5.7.5 其他方法
- Atomics.compareExchange(sharedArray, index, oldval, newval)：如果sharedArray[index]等于oldval，就写入newval，返回oldval。
- Atomics.isLockFree(size)：返回一个布尔值，表示Atomics对象是否可以处理某个size的内存锁定。如果返回false，应用程序就需要自己来实现锁定。
