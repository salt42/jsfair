## directives
##### ::
- :attr="VAR"
- :attr="FUNC()"
- :attr="VAR?VAR"
- :attr="VAR?VAR:VAR"
- :attr="VAR?'string':VAR"
- :attr="VAR==VAR?'string':'string'"
- :attr="FUNC()==VAR?'string':FUNC()"
##### #text
```
<p>{{VAR}}</p>
<p>{{FUNC()}}</p>
```
##### #css
```
<p #css="CSS_PROPERTIE_NAME:VAR"></p>
<p #css="color:FUNC()"></p>
<p #css="background-color:FUNC()::width:VAR"></p>
```

##### #for
```
<ul #for="user of userList">
    <li>{{user.name}}</li>
</ul>
```
##### #on
```
<p #on="click:handlerFunc(this, event)"></p>
<p #on="click:handlerFunc(this, event, VAR)"></p>
<p #on="click:div:handlerFunc(this, event)">
    <div></div>
</p>
<p #on="click:.selector:handlerFunc(this, event)">
    <div class="selector"></div>
</p>
```

##### #value -> Deprecated (use :value)
##### #data  -> Deprecated

## Components

#### section
persistent bedeutet componenten bleiben geladen inclusive ihrem dom und allen event handlern

```
<section default="comp-name"></section>
<section persistent></section>
```



