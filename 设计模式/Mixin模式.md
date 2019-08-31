# Mixin模式
一些提供能够被一个或者一组子类简单继承功能的类,意在重用其功能

优点：
- 提取功能，减少重复性

```javascript
// Define a simple Car constructor
var Car = function ( settings ) {
  this.model = settings.model || "no model provided";
  this.color = settings.color || "no colour provided";
};

// Mixin
var Mixin = function () {};
Mixin.prototype = {
  driveForward: function () {
    console.log( "drive forward" );
  },
  driveBackward: function () {
    console.log( "drive backward" );
  },
  driveSideways: function () {
    console.log( "drive sideways" );
  }
};

function augment( receivingClass, givingClass ) {
  if ( arguments[2] ) {
    for ( var i = 2, len = arguments.length; i < len; i++ ) {
      receivingClass.prototype[arguments[i]] = givingClass.prototype[arguments[i]];
    }
  }
  else {
    for ( var methodName in givingClass.prototype ) {
      if ( !Object.hasOwnProperty(receivingClass.prototype, methodName) ) {
        receivingClass.prototype[methodName] = givingClass.prototype[methodName];
      }
    }
  }
}

augment( Car, Mixin, "driveForward", "driveBackward" );

var myCar = new Car({
  model: "Ford Escort",
  color: "blue"
});

myCar.driveForward();
myCar.driveBackward();

// drive forward
// drive backward
```
