(function( $ ) {
    /**
     * The jQuery plugin namespace.
     * @external "jQuery.fn"
     * @see {@link http://docs.jquery.com/Plugins/Authoring The jQuery Plugin Guide}
     */

    /**
     * @function external:"jQuery.fn".getComponent
     */
    $.fn.getComponent = function() {
        if (this.length === 0 || !this[0].hasOwnProperty("jsFairComponent")) {
            return false;
        }
        return this[0].jsFairComponent;
    };

}( jQuery ));
(function() {
    "use strict";

    const DEV = false;
    /**
     * @namespace Global
     */
    const global = {
        DEPRECATED_WARNING: true,
    };
    /** @type {Scope} */
    let rootScope;
    let Modules = {},
        ModuleNames = [],
        Components = {},
        ComponentNames = [];
    let directives = {
        "::": {
            name: "::",
            /**
             * @param node
             * @param targetAttr
             * @param attr
             * @param {Scope} scope
             */
            init: function(node, targetAttr, attr, scope) {
                //parse attr
                let final = attr.split('+');
                let so = final[0].split('?');
                final = (final.length > 1) ? final[1] : false;
                let st;
                let when = so[0];
                let then = false;
                let els = false;
                if(so.length === 2 && so[1].indexOf(":") > -1) {
                    st = so[1].split(':');
                    then = st[0];
                    if (st.length > 1) els = st[1];
                } else if (so.length === 2) {
                    then = so[1];
                }
                //add change handler
                let watch = [];
                let compare = false;
                if (when.indexOf("==") > -1) {
                    watch = when = when.split("==");
                    watch[0] = watch[0].split(".")[0];
                    watch[1] = watch[1].split(".")[0];
                    compare = true;
                } else {
                    watch.push(when.split(".")[0]);
                    when = [when];
                }
                update();
                scope.onUpdate(watch, update);
                function update(prop) {
                    let rWhen = resolveCompare();
                    let rFinal;
                    if (final === false) {
                        rFinal = '';
                    } else {
                        rFinal = scope.resolve(final);
                    }
                    if (then) {
                        let att;
                        let c = (rWhen)? then: els;
                        if (c === false) {
                            node.setAttribute(targetAttr, rFinal);
                            return;
                        }
                        att = scope.resolve(c);
                        att += rFinal;
                        node.setAttribute(targetAttr, att);
                    } else {
                        let att = scope.resolve(when[0]) + rFinal;
                        node.setAttribute(targetAttr, att);
                    }
                }
                function resolveCompare() {
                    return (compare)? scope.resolve(when[0]) === scope.resolve(when[1]): scope.resolve(when[0]);
                }
            }
        },
        "#text": {
            name: "#text",
            /**
             * @param node
             * @param attr
             * @param {Scope} scope
             */
            init: function(node, attr, scope) {
                let re = /\{\{(.*?)\}\}/g;
                let match;
                let staticParts = [];
                let properties = [];
                let lastIndex = 0;
                if (!node.textContent.match(re) ) return;
                while ((match = re.exec(node.textContent)) != null) {
                    staticParts.push(node.textContent.substring(lastIndex, match.index));
                    properties.push(match[1]);
                    lastIndex = match.index + match[0].length;
                }
                function update() {
                    let res = "";
                    for (let i = 0; i < staticParts.length; i++) {
                        let v = scope.resolve(properties[i]);
                        res += staticParts[i] + ((v === undefined) ? "{{!!" + properties[i] + "}}": v );
                    }
                    node.textContent = res;
                }
                update();
                scope.onUpdate(properties, (v) => {
                    update();
                });
            }
        },
        "#css": {
            name: "#css",
            /**
             * @param node
             * @param attr
             * @param {Scope} scope
             */
            init: function(node, attr, scope) {
                //parse css
                let cssProps = [];
                let cssValues = [];
                let observedProps = [];
                let units = [];
                let css = attr.split(";");
                for (let i = 0; i < css.length; i++) {
                    let p = css[i].split(":");
                    cssProps.push(p[0]);
                    let val = p[1];
                    let unit = '';
                    let uIndex = val.indexOf('*');
                    if (uIndex > -1) {
                        unit = val.slice(uIndex + 1, val.length);
                        val = val.slice(1, -(unit.length+1) );
                    }
                    cssValues.push(val);
                    observedProps.push(p[1].replace(/\*.*/, ''));
                    units.push(unit);
                    node.style[p[0]] = scope.resolve(p[1]);
                }
                update(observedProps[0]);
                scope.onUpdate(observedProps, update);
                function update(prop) {
                    if (observedProps.indexOf(prop) < -1) return;
                    for (let i = 0; i < cssProps.length; i++) {
                        let unit = (units[i])? units[i]: '';
                        node.style[cssProps[i]] = scope.resolve(cssValues[i]) + unit + ' ';
                    }
                }
            }
        },
        "#node": {
            name: "#node",
            init: function(node, attr, scope) {
                scope.resolve(attr, node);
            }
        },
        "#comp": {
            name: "#comp",
            init: function(node, attr, scope) {
                setTimeout(() => {
                    if (!node.hasOwnProperty('jsFairComponent')) throw new Error('HTML node is not a Component! '); //@notLive
                    scope.resolve(attr, node.jsFairComponent);
                }, 1);
            }
        }
    };
    let directiveNames = [
        "::",
        "#text",
        "#css",
        "#node",
        "#comp"
    ];
    /**
     * Define a jsFair module
     * @param meta
     * @param initMethod
     */
    window.define = function(meta, initMethod) {
        let name = "";
        if (typeof meta === "string" ) {
            name = meta;
            meta = { name: name, };
        } else {
            name = meta.name;
        }
        if (!meta.dependencies) meta.dependencies = [];
        if (Modules.hasOwnProperty(name)) console.error("Module name '"+ name +"' already taken");//@notLive
        meta.init = initMethod;
        Modules[name] = meta;
        ModuleNames.push(name);
    };

    /**
     * @callback CompInitCallback
     * @param {Global} global
     * @param template
     * @param args
     */
    function CompInitCallback(global, template, args) {}
    /**
     *
     * @param {object|string} compMeta config object or component name
     * @param {CompInitCallback} initMethod
     */
    window.defineComp = function(compMeta, initMethod) {
        if (typeof compMeta === "string") {
            let compName = compMeta.toLowerCase();
            if (Components.hasOwnProperty(compName)) {
                console.error("Component name '" + compName + "' already taken");
            }
            compMeta = {
                name: compName,
            };
        }
        compMeta.init = initMethod;

        ComponentNames.push(compMeta.name);
        Components[compMeta.name] = compMeta;
    };

    /**
     * @callback DirectiveInitCallback
     * @param {HTMLElement} node
     * @param {String} attr
     * @param {Scope} scope
     */
    function DirectiveInitCallback(node, attr, scope) {}
    /**
     * @param {Object} meta
     * @param {DirectiveInitCallback} fn
     */
    window.defineDirective = function(meta, fn) {
        if (directives.hasOwnProperty(meta.name)) {
            console.error("Component name '" + meta.name + "' already taken");
        }
        meta.init = fn;

        directiveNames.push(meta.name);
        directives[meta.name] = meta;
    };

    function initDirective(name, node, attr, scope) {
        let firstChar = name.charAt(0);
        if (firstChar === '#') {
            if (!directives.hasOwnProperty(name)) return;
            directives[name].init(node, attr, scope);
        } else if (firstChar === ':') {
            directives['::'].init(node, name.substr(1), attr, scope);
        }
        if (node.nodeType === 1) node.removeAttribute(name);
    }
    function fragmentFromString(strHTML) {
        let temp = document.createElement('template');
        temp.innerHTML = strHTML;
        return temp.content;
    }
    function getTemplate(componentName, fn) {
        if (Components[componentName].hasOwnProperty("template")) {
            fn(fragmentFromString(Components[componentName].template));
            return;
        }
        let template = document.head.querySelector("#template-" + componentName + "-main");
        if (template && !DEV) {
            // let ele = document.importNode(template.content, true);
            fn(template.content.cloneNode(true));
        } else {
            fn(document.createDocumentFragment());
        }
    }

    /* GLOBAL */
    global.onModulesLoaded = new Rx.ReplaySubject();
    global.onPageLoaded = new Rx.ReplaySubject();
    global.onComponentLoaded = new Rx.ReplaySubject();
    //@todo deprecated
    global.loadSubComponents = ($ele) => {
        console.error("deprecated ")
        // return loadSubComps($ele[0])
    };
    //@todo deprecated
    global.getActiveComponent = function(sectionName) {
        console.error("deprecated ")
        let $section = $('section[name="'+ sectionName +'"]');
        if ($section.length < 0) {
            throw new Error("section with name '"+ sectionName+"' not found");
        }
        return $section.data("context");
    };
    /**
     * @memberOf Global
     * @param {jQuery} element
     * @param {function} fn
     * @param args
     */
    function loadComponent(element, fn, args) {
        element = $(element)[0];
        let scope = getScope(element);
        initComp(element, scope, args);
    }
    global.loadComponent = loadComponent;
    function getScope(element) {
        while(element = element.parentNode) {
            if (element.hasOwnProperty("jsFairScope") ) return element.jsFairScope;
        }
    }
    function getUID() {
        return Math.floor(1 + Math.random() * 0xfffffffff).toString(16);
    }

    class BaseComponent {
        constructor(name) {
            /** typeof {String}*/
            this.name = name;
            /** @typeof {Scope} scope*/
            this.scope;
            /** @typeof {Object} */
            this.data;
        }

        /** @param {Scope} scope */
        setScope(scope) {
            this.scope = scope;
            this.data = scope.data;
        }
        //@overwrite
        onLoad() {}
        //@overwrite
        onDestroy() {}
    }
    class Component extends BaseComponent {
        constructor(name) {
            super(name);
            this.$ele = null;
            this.template = null;
        }
        model(data) {
            this.scope.setData(data);
        }
        setData(data) {
            this.scope.setData(data);
        }
        setValue(path, value) {
            let name = path.split('.')[0];
            if (!this.data.has(name)) throw new Error("propetie '" + name + "' not found"); //@notLive
            this.scope.resolve(path, value);
            this.scope.onDataUpdate.next(path.split('.')[0]);
        }
        updateValue(path, value) {
            console.warn('deprecated -> use setValue instead')
            let name = path.split('.')[0];
            if (!this.data.has(name)) throw new Error("propetie '" + name + "' not found"); //@notLive
            this.scope.resolve(path, value);
            this.scope.onDataUpdate.next(path.split('.')[0]);
        }
        onValue(path, fn) {
            this.scope.onUpdate(path, (key) => fn(this.data[key], key) );
        }
    }
    class Scope {
        constructor(ref, ctx, type, subType) {
            let self = this;
            this.ID = getUID();
            this.type = type;
            this.subType = subType;
            /** @type {Rx.Subject} */
            this.onDataUpdate = new Rx.Subject();
            this.onDestroy = new Rx.Subject();
            this._data = {};
            this.context = ctx;
            this.children = [];
            this.data = new Proxy(this._data, {
                get: function(target, name) {
                    switch(name) {
                        case "has":
                            return target.hasOwnProperty;
                        case "onUpdate":
                            if (global.DEPRECATED_WARNING) console.error('DEPRECATED -> use Scope.onUpdate(...) instead');
                            return (...args) => {
                                self.onDataUpdate.subscribe(...args);
                            };
                        //@developBegin
                        //needed for jsfair dev tools plugin
                        case "toJSON":
                            return () => {
                                let res = {};
                                Object
                                    .entries(target)
                                    .filter(pair => !(pair[1] instanceof HTMLElement || pair[1] instanceof Scope || pair[1] instanceof Component) )
                                    .map((a) => {
                                        res[a[0]] = a[1];
                                    });
                                return res;
                            };
                        //@developEnd
                        default:
                            if (!target.hasOwnProperty(name)) return undefined;
                            return target[name];
                    }
                },
                set(target, property, value, receiver) {
                    if (target[property] === value) return true;
                    target[property] = value;
                    self.onDataUpdate.next(property);
                    return true;
                }
            });
            /** @type {Scope} */
            this.parent = null;
            this._subscriptions = [];
            this.ref = ref;
            this.refObserver = null;
            ref.jsFairScope = this;
        }
        onUpdate(keys, fn, _triggerScopeType) {
            if (typeof keys === 'string') keys = [keys];
            if (!_triggerScopeType) _triggerScopeType = this.subType;
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i].trim();
                if (typeof key !== 'string' || key.charAt(0) === "'") continue;
                let isFunc = key.indexOf("(") > -1;
                if (isFunc) {
                    let match = /(\w*[^()])+\((.*)\)$/.exec(key);
                    let func = this.resolveOnComps(match[1]);
                    if (typeof func !== 'function') throw new Error("Can't resolve function '" + key + "' used in component " + _triggerScopeType);//@notLive
                    if (match[2] === '') continue;
                    let args = match[2]
                        .split(",")
                        .map(v => v.trim());
                    if (args.length > 0) this.onUpdate(args, fn, _triggerScopeType);
                    continue;
                }
                let prop = key.split('.')[0];
                if (!this._data.hasOwnProperty(prop) ) {
                    if (this.parent) {
                        this.parent.onUpdate(key, fn, _triggerScopeType);
                    } else {
                        if (!isNaN(Number(key))) continue;
                        throw new Error("Can't resolve '" + key + "' ");//@notLive
                    }
                } else {
                    this.onDataUpdate
                        .filter(p => p === prop)
                        .subscribe(fn);
                }
            }
        }
        setData(data) {
            let self = this;
            if (!data) throw "First argument of setData must be an Object";
            for (let prop in data) {
                if (!data.hasOwnProperty(prop)) continue;
                switch (typeof data[prop]) {
                    case 'object':
                        if (data[prop] instanceof Rx.Observable) {
                            this._data[prop] = null;
                            observerHandler(data, prop);
                            continue;
                        }
                        this._data[prop] = data[prop];
                        break;
                    case 'string':
                        let firstChar = data[prop].charAt(0);
                        if (firstChar === '@') {
                            if (data[prop].charAt(1) === '@') {
                                //bind attribute bidirectional
                                let attributeName = data[prop].slice(2);
                                let parentProp = this.ref.getAttribute(attributeName);
                                if (parentProp === null) throw new Error("Attribute '"+ attributeName +"' not found on " + this.context);//@notLive
                                let scope = this.resolve2scope(parentProp);
                                if (!scope) {
                                    this.bindAttribute(data[prop].slice(2), prop);
                                    break;
                                    // throw new Error("Property '"+ parentProp +"' not found in parent Scopes");
                                }
                                let lock = false;
                                this._data[prop] = scope.resolve(parentProp);
                                scope.onUpdate(parentProp, () => {
                                    //value changed in parent scope
                                    lock = true;
                                    this.data[prop] = scope.resolve(parentProp);
                                    lock = false;
                                });
                                this.onUpdate(prop, () => {
                                    //value changed in this scope
                                    if (lock) return;
                                    scope.resolve(parentProp, this.data[prop]);
                                    scope.onDataUpdate.next(parentProp.split('.')[0]);
                                });
                            } else {
                                this.bindAttribute(data[prop].slice(1), prop);
                            }
                        } else {
                            this._data[prop] = data[prop];
                        }
                        break;
                    case 'function':

                        // BIND(global.PostService, 'searchQuery');
                        //
                        // // let args = /\(([\w,\s]*)\)/.exec(data[prop].toString())[1].split(',').map(e => e.trim());
                        // //@todo or not todo is here the question
                        // //call func
                        // let r = data[prop]();
                        // Object.assign(r.obj, {
                        //     set query
                        // });
                        //result object and prop
                        //set setter and getter to object

                    default:
                        this._data[prop] = data[prop];
                }
                // this._data[prop] = data[prop];
                this.onDataUpdate.next(prop);//@todo move after for???
            }
            function observerHandler(data, prop) {
                self._subscriptions.push(
                    data[prop].subscribe((d) => {
                        self.data[prop] = d;
                    })
                );
            }
        }
        bindAttribute(attrName, propName) {
            if (typeof attrName !== 'string' || typeof propName !== 'string') throw new Error("type of arguments must be string"); //@notLive
            let self = this;
            // create observer if not
            if (!this.refObserver) {
                let observer = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                        let index = observer._observedAttributNames.indexOf(mutation.attributeName);
                        if (index < 0) return;
                        updateData(mutation.attributeName, observer._mappedPropeties[index]);
                    });
                });
                observer.observe(this.ref, {
                    attributes: true, // childList: true, // characterData: true
                });
                observer._observedAttributNames = [attrName];
                observer._mappedPropeties = [propName];
                this.refObserver = observer;
                updateData(attrName, propName);
                return;
            }
            this.refObserver._observedAttributNames.push(attrName);
            this.refObserver._mappedPropeties.push(propName);
            updateData(attrName, propName);

            function updateData(attr, prop) {
                let c = self.ref.getAttribute(attr);
                self.data[prop] = (c === '')? true: c || false;
            }
        }
        resolveOnComps(property) {
            if (this.type === "comp" && this.context.hasOwnProperty(property))
                return this.context[property];
            return (this.parent)? this.parent.resolveOnComps(property): undefined;
        }
        resolve2scope(property) {
            let parts;

            if (typeof property === "string") {
                property = property.trim();
                if (property.charAt(0) === "'") {
                    if(property.charAt(property.length-1) !== "'") throw new Error("String not closed");//@notLive
                    return undefined;
                }
                parts = property.split(".");
            } else {
                parts = property;
            }
            if (this.data.has(parts[0])) {
                return this;
            } else {
                return (this.parent)? this.parent.resolve2scope(parts): undefined;
            }
        }
        resolve(property, write) {
            let parts;

            if (typeof property === "string") {
                property = property.trim();
                if (property.charAt(0) === "'") {
                    if(property.charAt(property.length-1) !== "'") throw new Error("String not closed");//@notLive
                    return property.slice(1, -1);
                }
                let isFunc = property.indexOf("(") > -1;
                if (isFunc) {
                    let match = /(\w*[^()])+\((.*)\)$/.exec(property);
                    //resolve function name
                    let func = this.resolveOnComps(match[1]);
                    if (typeof func !== 'function') throw new Error("'" + match[1] + "' is not a valid method of component '"+ this.getComp().name + "'");//@notLive
                    //resolve all arguments
                    let args = match[2].split(",");
                    let resolvedArgs = [];
                    for (let arg of args) {
                        resolvedArgs.push(this.resolve(arg) );
                    }
                    //run function
                    return func.apply(null, resolvedArgs);
                }
                parts = property.split(".");
            } else {
                parts = property;
            }
            if (this.data.has(parts[0])) {
                let last = this._data;
                for (let i = 0; i < parts.length; i++) {
                    if (last === null || last === undefined) return undefined;
                    if (write !== undefined && i === parts.length - 1) {
                        last[ parts[i] ] = write;
                    }
                    last = last[ parts[i] ];
                }
                return last;
            } else {
                return (this.parent)? this.parent.resolve(parts): undefined;
            }
        }
        /**
         * @param {Scope} scope
         */
        add(scope) {
            this.children.push(scope);
            scope.parent = this;
        }
        /**
         * @returns {Component}
         */
        getComp() {
            if (this.ref.hasOwnProperty("jsFairComponent"))
                return this.ref.jsFairComponent;
            else if (this.parent)
                return this.parent.getComp();
        }
        destroyAllChilds() {
            if (!this.children) return;
            for (let i = 0; i < this.children.length; i++) {
                this.children[i]._destroy();
            }
            this.children = [];
        }
        destroyChild(childScope) {
            if (!this.children) return;
            let index = this.children.indexOf(childScope);
            if (index === false) return;
            this.children[index]._destroy();
            this.children.splice(index, 1);
        }
        destroy() {
            this.parent.destroyChild(this);
        }
        _destroy() {
            this.destroyAllChilds();
            for (let i = 0; i < this._subscriptions.length; i++) {
                this._subscriptions[i].unsubscribe();
            }
            this._subscriptions = [];
            this.context.onDestroy();
            this.parent = null;
            if (this.onDataUpdate) this.onDataUpdate.complete();
            this.onDataUpdate = null;
            if (this.ref) {
                if (this.ref.jsFairScope) delete this.ref.jsFairScope;
                if (this.ref.jsFairComponent) delete this.ref.jsFairComponent;
            }
            this.ref = null;
            this.children = null;
            this.data = null;
        }
        toJSON() {
            return {
                ID: this.ID,
                type: this.type,
                subType: this.subType,
                children: this.children,
                data: this.data
            };
        }
    }
    class Module {
        constructor() {}
    }
    /**
     * @memberOf Global
     * @param {Element|DocumentFragment} node
     * @param {Scope} scope
     */
    function initSubTree(node, scope) {
        node = node.firstChild;
        while (node) {
            switch(node.nodeType) {
                case 1:
                    let tagName = node.tagName;
                    let attrNames = Array.from(node.attributes);
                    let stopParse = false;
                    for (let attr of attrNames) {
                        let name = attr.name;
                        let firstChar = name.charAt(0);
                        if (firstChar !== "#" && firstChar !== ":") continue;
                        if (name === '#dontparse') {
                            stopParse = true;
                            break;
                        }
                        initDirective(name, node, attr.nodeValue, scope);
                    }
                    if (stopParse) {
                        node = node.nextSibling;
                        continue;
                    }
                    if (tagName) {
                        if (Components.hasOwnProperty(tagName.toLowerCase())) {
                            initComp(node, scope, []);
                            node = node.nextSibling;
                            continue;
                        }
                    }
                    initSubTree(node, scope);
                    break;
                case 3:
                    initDirective("#text", node, null, scope);
                    break;
                default:
                    initSubTree(node, scope);
            }
            node = node.nextSibling;
        }
    }
    global.initSubTree = initSubTree;
    /**
     * @memberOf {array<Element> | jquery} Global
     * @param $nodes
     */
    function removeNode($nodes) {
        if (!$nodes) return;
        for (let node of $nodes) {
            cleanTree(node);
            if (node.jsFairScope) {
                node.jsFairScope.destroy();
            }
            if (node.parentNode) node.parentNode.removeChild(node);
        }
    }
    global.removeNode = removeNode;
    function cleanTree(node) {
        node = node.firstChild;
        while (node) {
            if (node.jsFairScope) {
                node.jsFairScope.destroy();
            } else {
                cleanTree(node);
            }
            node = node.nextSibling;
        }
    }
    /**
     * @memberOf Global
     * @param {Element} node
     * @param {Scope} scope
     * @param args
     */
    function initComp(node, scope, args) {
        let componentName = node.tagName.toLowerCase();
        componentName = componentName.toLowerCase();
        if (node.hasOwnProperty("jsFairComponent") ) {
            return;
        }
        if (!Components.hasOwnProperty(componentName)) throw ("no component with name: " + componentName);
        let ctx = new Component(componentName);
        let compScope = new Scope(node, ctx, "comp", componentName);
        ctx.setScope(compScope);
        scope.add(compScope);
        ctx.$ele = $(node);
        $(node).data("context", ctx);//@todo deprecated
        node.jsFairComponent = ctx;
        node.getComponent = () => {
            //@todo mark as deprecated????
            return ctx;
        };

        getTemplate(componentName, (template) => {
            Components[componentName].init.call(ctx, global, $(template), args);
            initSubTree(template, compScope);
            node.appendChild(template);

            if (ctx.hasOwnProperty("onLoad") && typeof ctx.onLoad === "function") {
                ctx.onLoad($(node));
            }
        });
    }
    global.initComp = initComp;

    function initModules() {
        let loaded = [];
        let toLoad = ModuleNames.slice();
        let knockOutCount = 0;
        while(toLoad.length !== 0) {
            let rest = [];
            for (let i = 0; i < toLoad.length; i++) {
                let moduleName = toLoad[i];
                let module = Modules[moduleName];
                let canLoad = true;
                for (let dep of module.dependencies) {
                    if (loaded.indexOf(dep) > -1) continue;
                    canLoad = false;
                    break;
                }
                if (canLoad) {
                    let context = new Module();
                    Modules[moduleName].init.call(context, global);
                    global[moduleName] = context;
                    loaded.push(moduleName);
                } else {
                    rest.push(moduleName);
                }
            }
            toLoad = rest;
            knockOutCount++;
            if (knockOutCount > 10) break;
        }
        global.onModulesLoaded.next();
    }
    window.onload = function() {
        rootScope = new Scope(document.body, {onDestroy() {}}, "ROOT");
        initModules();

        // load components
        initSubTree(document.body, rootScope);
        global.onPageLoaded.next();

        sendToInspector("onPageLoaded", "");
        sendToInspector("onTreeChanged", rootScope);
        if (global.AppState) {
            global.AppState.onAppStateChanged.subscribe(() => {
                sendToInspector("onTreeChanged", rootScope);
            });
        }
    };

    window.jsFair = {};
    window.jsFair.global = global;
    window.jsFair.Module = Module;
    window.jsFair.Scope = Scope;
    window.jsFair.Component = Component;
    window.jsFair.BaseComponent = BaseComponent;
    window.jsFair.Directives = directives;
    window.jsFair.Components = Components;

    function sendToInspector(com, data) {
        let d = {
            source: "PAGE",
            com: com,
            body: JSON.stringify(data)
        };
        window.postMessage(d, "*");
    }
    function receiveMessage(event) {
        event = event.detail;
        switch (event.com) {
            case 'getTree':
                sendToInspector("onTreeChanged", rootScope);
                break;
            case 'config':
                if (!event.body || !event.body.key) return;
                //@todo set config value
                break;
        }
    }
    window.addEventListener("jsfairCom", receiveMessage);

})();

defineDirective({ name: "#for" }, function (node, attr, scope) {
    let template = document.createRange().createContextualFragment(node.innerHTML);
    if (!node.innerHTML || !template.firstChild) {
        console.log('no template in for');
        return;
    }
    node.innerHTML = '';
    while (template.firstChild.nodeType !== 1) {
        template.removeChild(template.firstChild);
    }

    //attr auslesen
    let a = attr.match(/(.*) (of|in) (.*)/);
    if (a.length !== 4) throw "Error in #for";//@notLive
    let loopType = a[2];
    let scopeVars = a[1].split(',').map(e => e.trim());
    let observedProp = a[3];
    let _data = scope.resolve(a[3]) || ((loopType === 'of')? []: {});
    let forScope = new jsFair.Scope(node, {onDestroy: discard}, "#for", a[3]);
    scope.add(forScope);
    redraw();

    scope.onUpdate(observedProp, redraw);
    function redraw() {
        forScope.destroyAllChilds();
        node.innerHTML = "";
        _data = scope.resolve(a[3]);
        if (!_data) return;
        let fragment = document.createDocumentFragment();

        if (loopType === 'of') {
            if (typeof _data[Symbol.iterator] !== 'function') throw new Error("for of expects iterator, in Component '"+scope.getComp().name+"' at '" + attr + "'");//@notLive
            if (typeof _data[Symbol.iterator] !== 'function') return;
            for (let i of _data.keys()) {
                let subFrag = template.cloneNode(true);
                let itemScope = new jsFair.Scope(subFrag.firstChild, {
                    onDestroy() {
                    }
                }, scopeVars[0], "[" + i + "]");
                itemScope.data[scopeVars[0]] = _data[i];
                if (scopeVars.length > 1) itemScope.data[scopeVars[1]] = i;
                forScope.add(itemScope);
                jsFair.global.initSubTree(subFrag, itemScope);
                fragment.append(subFrag);
            }
        } else if (loopType === 'in'){
            if (typeof _data !== 'object') throw new Error("for in expects Object, in Component '"+scope.getComp().name+"' at '" + attr + "'");//@notLive
            if (typeof _data !== 'object') return;

            for (let key in _data) {
                let subFrag = template.cloneNode(true);
                let itemScope = new jsFair.Scope(subFrag.firstChild, {
                    onDestroy() {
                    }
                }, scopeVars[0], "{" + key + "}");
                itemScope.data[scopeVars[0]] = _data[key];
                if (scopeVars.length > 1) itemScope.data[scopeVars[1]] = key;
                forScope.add(itemScope);
                jsFair.global.initSubTree(subFrag, itemScope);
                fragment.append(subFrag);
            }
        }
        node.append(fragment);
    }
    function discard() {

    }
});
defineDirective({ name: "#on" }, function (node, attr, scope) {
    //attr auslesen
    let comp = scope.getComp();
    let events = attr.split(";");
    for (let event of events) {
        createEventHandler(event);
    }
    function createEventHandler(event) {
        let match;
        let e = event.split(":");
        let isFilter = (e.length === 3);
        let filter = e[1];
        event = (isFilter)? e[2]: e[1];
        match = event.match(/(\w*)\(([\w,\s.]*)\)/);
        let eventType = e[0];
        let eventHandler = match[1];
        let eventHandlerArgs = match[2].replace(/\s/g, '').split(",");
        node.addEventListener(eventType, function (e) {
            let targetNode = node;
            let targetScope = scope;
            if (isFilter) {
                targetNode = hasParent(e.target, filter);
                if (targetNode.hasOwnProperty("jsFairScope") ) targetScope = targetNode.jsFairScope;
                if (!targetNode) return;
            }
            let args = [];
            for (let i = 0; i < eventHandlerArgs.length; i++) {
                args.push(resolve(eventHandlerArgs[i], e, targetNode, targetScope));
            }
            if (typeof comp[eventHandler] === "function") comp[eventHandler](...args);
        });
    }
    function resolve(name, event, node, scope) {
        if (name === "event") return event;
        if (name === "this") return node;
        return scope.resolve(name);
    }
    /**
     * @private
     * @param  {Element} elem     Starting element
     * @param  {String}  selector Selector to match against
     * @return {Boolean|Element}  Returns false if not match found
     */
    function hasParent(elem, selector) {
        // Element.matches() polyfill
        if (!Element.prototype.matches) {
            Element.prototype.matches =
                Element.prototype.matchesSelector ||
                Element.prototype.mozMatchesSelector ||
                Element.prototype.msMatchesSelector ||
                Element.prototype.oMatchesSelector ||
                Element.prototype.webkitMatchesSelector ||
                function(s) {
                    let matches = (this.document || this.ownerDocument).querySelectorAll(s),
                        i = matches.length;
                    while (--i >= 0 && matches.item(i) !== this) {}
                    return i > -1;
                };
        }

        if ( elem.matches( selector ) ) return elem;
        for ( ; elem && elem !== document; elem = elem.parentNode ) {
            if ( elem.matches( selector ) ) return elem;
        }
        return false;
    }
});
defineDirective({ name: "#value" }, function (node, attr, scope) {
    // let allowedTags = ['input, select, textarea'];
    //@todo error for not allowed tags
    //@todo error attr can't be a function call or if|then|else or compare
    //@todo control input or change event
    let type = node.getAttribute('type');
    let targetAttr = (type === 'checkbox')? 'checked': 'value';
    let event = (type === 'checkbox')? 'change': 'input';//@todo check radio buttons
    node.addEventListener(event, function (e) {
        let value;
        switch(type) {
            case 'checkbox': value = e.target.checked; break;
            case 'file': value = e.target.files; break;
            default: value = e.target.value;
        }
        scope.resolve(attr, value);
        scope.onDataUpdate.next(attr.split('.')[0]);
    });
    if (type === 'file') return;
    update();
    scope.onUpdate(attr, update);
    function update() {
        if (targetAttr === 'checked') {
            node.checked = scope.resolve(attr);
        } else {
            node.value = scope.resolve(attr);
        }
    }
});
defineDirective({ name: "#data" }, function (node, attr, scope) {
    let a = attr.split(":");
    if (a.length !== 2) throw "Error in #data";//@notLive

    update();
    scope.onUpdate(a[1], update);
    function update() {
        node.dataset[a[0]] = scope.resolve(a[1]);
    }
});
defineDirective({ name: "#if" }, function (node, attr, scope) {
    let inverted = (attr.charAt(0) === '!');
    attr = (inverted)? attr.slice(1): attr;
    let props = attr.split("==");
    update();
    scope.onUpdate(props, update);
    function update() {
        let equal = props
            .map((value) => {
                let v = scope.resolve(value);
                return (v === undefined)? value: v;
            })
            .reduce((a, b) => (a == b)? true: false);
        if ((inverted)? !equal: equal)
            node.style.display = '';
        else
            node.style.display = 'none';
    }
});