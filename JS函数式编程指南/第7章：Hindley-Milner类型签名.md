# 第7章：Hindley-Milner类型签名
函数类型注释
- 最后的类型为返回值
- 括号为函数

```javascript
//  capitalize :: String -> String
// capitalize函数接受String类型参数，返回String类型参数
var capitalize = function(s){
  return toUpperCase(head(s)) + toLowerCase(tail(s));
}

capitalize("smurf");
//=> "Smurf"

//  match :: Regex -> (String -> [String])
// match函数接受Regex类型参数，返回一个函数，这个函数接受String类型参数返回String类型
var match = curry(function(reg, s){
  return s.match(reg);
});
```

## 参考
- [第7章：Hindley-Milner类型签名](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/ch7.html)
