# react-router
- BrowserRouter || hashRouter：提供全局的一些属性和方法并且监听路由的变化
- Route：匹配路径渲染组件
- Switch：渲染与该地址匹配的第一个子节点
- Link：渲染指定路径组件（push叠加历史记录）
- Redirect：重定向到指定路径组件（replace覆盖当前历史记录）
- withRoute：使组件带有match、location、history属性

## 1.BrowserRouter
```typescript jsx
import React from "react";
import { Router } from "react-router";

// BrowserRouter
import { createBrowserHistory as createHistory } from "history";

// HashRouter
// import { createHashHistory as createHistory } from "history";

class BrowserRouter extends React.Component {
  history = createHistory(this.props);
  render() {
    return <Router history={this.history} children={this.props.children} />;
  }
}
```

## 2.Router
- 保存和维护一些全局属性和方法（ `Provider` ）
- 监听路由变化（ `popstate` ）
- 渲染组件

### 2.1 用法：
```typescript jsx
import React from 'react';
import ReactDOM,{render} from 'react-dom';
import Home from './components/Home.js';
import User from './components/User.js';
import {BrowserRouter as Router, Route} from './react-router-dom'
render(
  <Router>
    <div>
      <Route path="/" component={Home}>
      <Route path="/user" component={User}>
    </div>
  </Router>, window.root);
```

### 2.2 源码：
```typescript jsx
import React from 'react';
import {Provider} from './context';
import RouterContext from "./RouterContext.js"

export default class BrowserRouter extends React.Component{
  static computeRootMatch(pathname) {
    return { path: "/", url: "/", params: {}, isExact: pathname === "/" };
  }
  constructor(props) {
    super(props);
    this.state = {
      location: props.history.location
    };
    if (!props.staticContext) {
      this.unlisten = props.history.listen(location => {
        this.setState({ location });
      });
    }
  }
  render() { 
    return( 
      <RouterContext.Provider
        children={this.props.children || null}
        value={{
          history: this.props.history,
          location: this.state.location,
          match: Router.computeRootMatch(this.state.location.pathname),
          staticContext: this.props.staticContext
        }}
      />
    )
  }
}
```

## 3.Route
匹配路径渲染组件

### 3.1 使用
```typescript jsx
import React from 'react';
import ReactDOM,{render} from 'react-dom';
import Home from './components/Home.js';
import User from './components/User.js';
import {BrowserRouter as Router,Route} from './react-router-dom'
render(
  <Router>
    <div>
      <Route path="/" component={Home}>
      <Route path="/user" component={User}>
      /*采用render参数会执行对应的函数*/
      <Route path="/user" render={(props)=>{
        return <user/>
      }}/>
    </div>
  </Router>, window.root);
```
### 3.2 源码
```typescript jsx
import React from 'react';
import RouterContext from "./RouterContext.js"
import pathToRegExp from 'path-to-regexp';

// 不是通过Route渲染出来的组件没有match、location、history三个属性
export default class Route extends React.Component{
  render(){
    return (
      <RouterContext.Consumer>
        {context => {
          const location = this.props.location || context.location;
          
          // 判断是否匹配
          const match = this.props.computedMatch
            ? this.props.computedMatch // <Switch> already computed the match for us
            : this.props.path
            ? matchPath(location.pathname, this.props)
            : context.match;

          const props = { ...context, location, match };

          let { children, component, render } = this.props;

          // Preact uses an empty array as children by
          // default, so use null if that's the case.
          if (Array.isArray(children) && children.length === 0) {
            children = null;
          }

          return (
            <RouterContext.Provider value={props}>
              {props.match
                ? children
                  ? typeof children === "function" ? children(props) : children
                  : component
                  ? React.createElement(component, props)
                  : render
                  ? render(props)
                  : null
                : typeof children === "function" ? children(props) : null
              }
            </RouterContext.Provider>
          );
        }}
      </RouterContext.Consumer>
    )
  }
}
```

## 3.Switch
渲染与该地址匹配的第一个子节点

## 3.1 用法
```typescript jsx
import React from 'react';
import ReactDOM,{render} from 'react-dom';
import Home from './components/Home.js';
import User from './components/User.js';
import Article from './components/Article';
import {BrowserRouter as Router,Route,Switch} from './react-router-dom'
render(
  <Router>
    <Switch>
      <Route path="/" exact={true} component={Home}></Route>
      <Route path="/user" exact={true} component={User}></Route>
      <Route path="/article/:id" component={Article}/>
    </Switch>
  </Router>,window.root);
```

## 3.2 源码
```typescript jsx
import React from 'react';
import RouterContext from "./RouterContext.js"

export default class Switch extends React.Component {
  render() {
    return (
      <RouterContext.Consumer>
        {context => {
          const location = this.props.location || context.location;

          let element, match;

          React.Children.forEach(this.props.children, child => {
            if (match == null && React.isValidElement(child)) {
              element = child;

              const path = child.props.path || child.props.from;

              match = path
                ? matchPath(location.pathname, { ...child.props, path })
                : context.match;
            }
          });

          // 只会渲染匹配中的一个路由组件
          return match
            ? React.cloneElement(element, { location, computedMatch: match })
            : null;
        }}
      </RouterContext.Consumer>
    );
  }
}
```

## 4.Redirect
重定向到指定路径组件（replace覆盖当前历史记录）

### 4.1 使用
```typescript jsx
import React from 'react';
import ReactDOM,{render} from 'react-dom';
import Home from './components/Home.js';
import User from './components/User.js';
import Article from './components/Article';
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from './react-router-dom'
render(
  <Router>
    <Switch>
      <Route path="/" exact={true} component={Home}></Route>
      <Route path="/user" exact={true} component={User}></Route>
      <Route path="/article/:id" component={Article}/>
      <Redirect to="/"/>
    </Switch>
  </Router>,window.root);
```

### 4.2 源码
```typescript jsx
import React from 'react';
import RouterContext from "./RouterContext.js"

function Redirect({ computedMatch, to, push = false }) {
  return (
    <RouterContext.Consumer>
      {({history})=>{   //修改url，重新渲染组件
        history.push(this.props.to);
        return null
      }}
    </RouterContext.Consumer>
  );
}
```

## 5.link
### 5.1 使用
```typescript jsx
import React from 'react';
import ReactDOM,{render} from 'react-dom';
import Home from './components/Home.js';
import User from './components/User.js';
import Article from './components/Article';
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from './react-router-dom'
render(
  <Router>
    <Link to="/">首页 </Link>
    <Link to="/user">用户</Link>
    <Switch>
      <Route path="/" exact={true} component={Home}></Route>
      <Route path="/user" exact={true} component={User}></Route>
      <Route path="/article/:id" component={Article}/>
      <Redirect to="/"/>
    </Switch>
  </Router>,window.root );
```

### 5.2 源码
```typescript jsx
import React from 'react';
import RouterContext from "./RouterContext.js"
export default class Link extends React.Component{
  render(){
    return <RouterContext.Consumer>
      {({history})=>{   //点击触发回调用，修改url，重新渲染组件
        return <a onClick={()=>{
          history.push(this.props.to)
        }}>{this.props.children}</a>
      }}
    </RouterContext.Consumer>
  }
}
```

## 6.withRoute
使组件带有match、location、history属性

## 6.1 使用
```typescript jsx
import React from 'react';
import ReactDOM,{render} from 'react-dom';
import {BrowserRouter as Router,Route,Link,Switch,Redirect, withRouter} from './react-router-dom'
import Home from './components/Home.js';
import User from './components/User.js';
import Article from './components/Article.js';

class Logo extends Component {
  handleClick = ()=>{
   this.props.history.push('/withRouterLink') // url变化，组件的跳转
  }
  render() {
    return (
      <div className="navbar-brand" onClick={this.handleClick}>Logo</div>
    )
  }
}
// 高阶组件
const withRouterLink = withRouter(Logo)

render(
  <Router>
    <Switch>
      <Route path="/" exact={true} component={Home} />
      <Route path="/user" exact={true} component={User} />
      <Route path="/article/:id" component={Article}/>
    </Switch>
    <Route path="/logo" exact={true} component={withRouterLink} />
  </Router>,window.root);
```

## 6.2 源码
```typescript jsx
import React from 'react';
import RouterContext from "./RouterContext.js";
function withRouter(Component) {
  return props => {
    return (
      <RouterContext.Consumer>
        {context => {
          return (
            <Component {...props}/>
          );
        }}
      </RouterContext.Consumer>
    );
  };
}

export default withRouter;
```

## 参考
- [react-router](https://github.com/ReactTraining/react-router)
- [让react用起来更得心应手——（react-router原理简析）](https://juejin.im/post/5bcdb66251882577102a3b21#heading-0)
