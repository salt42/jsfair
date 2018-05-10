## directives
##### ::

```html
<div :attr="VAR"></div> <- become -> <div attr=""></div>
<div :attr="VAR"></div>
<div :id="FUNC()"></div>
<div :attr="VAR?VAR"></div>
<div :attr="VAR?VAR:VAR"></div>
<div :attr="VAR?'string':VAR"></div>
<div :attr="VAR==VAR?'string':'string'"></div>
<div :attr="FUNC()==VAR?'string':FUNC()"></div>
```

##### #text
```html
<p>{{VAR}}</p>
<p>{{FUNC()}}</p>
```

##### #css
```html
<p #css="CSS_PROPERTIE_NAME:VAR"></p>
<p #css="color:FUNC()"></p>
<p #css="background-color:FUNC();width:VAR"></p>
```

##### #node
```html
<div #node="comp"></div>
```
##### #comp
```html
<my-comp #comp="comp"></my-comp>
isComp?  <span :class="compOK?'comp-ok'">yes!</span>
```
##### #for
```html
<ul #for="user of userList">
    <li>{{user.name}}</li>
</ul>
<ul #for="value, index of Array">...
<ul #for="user, key of Object">...
```

##### #on
```html
<p #on="click:handlerFunc(this, event)"></p>
<p #on="click:handlerFunc(this, event, VAR)"></p>
<p #on="click:div:handlerFunc(this, event)">
    <div></div>
</p>
<p #on="click:.selector:handlerFunc(this, event)">
    <div class="selector"></div>
</p>
```

##### #value
bidirectional bind input/textarea/select value to model
```html
<div #if="bool"></div>
<div #if="!bool"></div>
<span #if="values.count==10"></span>
```

##### #data

##### #if
hide element when false
```html
<div #if="bool"></div>
<div #if="!bool"></div>
<span #if="values.count==10"></span>
```

##### #goto
```html
<a #goto="/go/to/url">Link</a>
```
not implemented yet
```html
<a #goto="state">Link</a>
```


## Components


```haml
<my-component user-id="2" user="users.0"></my-component>
```

```ecmascript 6
defineComp("my-component", function (G) {
   "use strict";
   /** @this Component */
   this.setData({
       UserID: '@user-id',
       User: '@@user',
       count: 42,   // all primitives
       RXobservable: new Rx.subject(),  //reactiveX subjects
   });
   
   this.onLoad = () => { };
});
```
- comp namen sind eindeutig
- comp namen sind lisp-case
- comp die file namen dazu sind camelCase
- nur direkte properties auf dem data object werden observed



## default Components


#### section
persistent bedeutet componenten bleiben geladen inclusive ihrem dom.

```
<section default="comp-name"></section>
<section persistent></section>
```
