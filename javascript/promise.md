# promise

```javascript
const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

function MyPromise(fn) {
  var that = this
  that.state = PENDING
  that.value = null
  that.resolvedCallbacks = []
  that.rejectedCallbacks = []
  
  function resolve(value) {
    if (that.state === PENDING) {
      that.state = RESOLVED
      that.value = value
      that.resolvedCallbacks.map(cb => cb(that.value))
    }
  }
  
  function reject(value) {
    if (that.state === PENDING) {
      that.state = REJECTED
      that.value = value
      that.rejectedCallbacks.map(cb => cb(that.value))
    }
  }
  
  try {
    fn(resolve, reject)
  } catch (e) {
    reject(e)
  }
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
  onRejected = typeof onRejected === 'function' ? onRejected: r => { throw r }
  if (this.state === PENDING) {
    this.resolvedCallbacks.push(onFulfilled)
    this.rejectedCallbacks.push(onRejected)
  }
  if (this.state === RESOLVED) {
    onFulfilled(this.value)
  }
  if (this.state === REJECTED) {
    onRejected(this.value)
  }
}

new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
}).then(value => {
  console.log(value)
})
```
