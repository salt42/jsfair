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
    const global = {};
    /** @type {Scope} */
    let rootScope;
    let Modules = {},
        ModuleNames = [],
        Components = {},
        ComponentNames = [],
        TemplateCache = {
            hash: [],
            templates: [],
            add: (id, template) => {
                TemplateCache.hash.push(id);
                TemplateCache.templates.push(template);
            },
            get: (id) => {
                let index = TemplateCache.hash.indexOf(id);
                if (index < 0) return false;
                return TemplateCache.templates[index];
            },
            has: (id) => {
                return (TemplateCache.hash.indexOf(id) !== -1);
            }
        };

    let directives = {
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
                scope.data.onUpdate.subscribe((prop) => {
                    // if (prop === "" ) {
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
                let cssProps = attr.split(";");
                for (let i = 0; i < cssProps.length; i++) {
                    let prop = cssProps[i].split(":");
                    // style = TryResolveVar(prop[0], scopeStack) + ":" + TryResolveVar(prop[1], scopeStack) + ";";
                    node.style[prop[0]] = scope.resolve(prop[1]);
                }
                //remove #attr
                //add css attr
                // function TryResolveVar(name, scopeStack, data) {
                //     let nameParts = name.split(".");
                //     for (let i = 0; i < scopeStack.length; i++) {
                //         if (scopeStack[i].hasOwnProperty(nameParts[0]) ) return re(scopeStack[i]);
                //     }
                //     if (ctx.data.has(nameParts[0])) return ctx.data[nameParts[0]];
                //     return name;
                //     function re(target) {
                //         let lastValue = target;
                //         for (let j = 0; j < nameParts.length; j++) {
                //             if (!lastValue.hasOwnProperty(nameParts[j]) ) return name;
                //             lastValue = lastValue[nameParts[j]];
                //         }
                //         return lastValue;
                //     }
                // }
            }
        }
    };
    let directiveNames = [
        "#text",
        "#css"
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
        if (!directives.hasOwnProperty(name)) return;
        // @todo if (!attr) attr = node.attributes[name]
        directives[name].init(node, attr, scope);
    }

    function getTemplate(componentName, templatePath, fn) {
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
    class BaseComponent {
        constructor(name) {
            /** typeof {String} */
            this.name = name;
            /** typeof {Scope} */
            this.scope;
            /** typeof {Object} */
            this.data;
        }
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
        observeAttributes(fn) {
            //todo
            // let observer = new MutationObserver(function(mutations) {
            //     mutations.forEach(function(mutation) {
            //         console.log(mutation.type);
            //     });
            // });
            // observer.observe($element[0], {
            //     attributes: true,
            //     childList: true,
            //     characterData: true
            // });
        }
        model(data) {
            this.scope.setData(data);
        }
        setData(data) {
            this.scope.setData(data);
        }
    }

    function getUID() {
        return Math.floor(1 + Math.random() * 0xfffffffff).toString(16);
    }
    class Scope {
        constructor(ref, ctx, type, subType) {
            let self = this;
            this.ID = getUID();
            this.type = type;
            this.subType = subType;
            /** @type {Rx.Subject} */
            this.onDataUpdate = new Rx.Subject();
            this._data = {};
            this.ref = ref;
            this.context = ctx;
            this.children = [];
            this.data = new Proxy(this._data, {
                get: function(target, name) {
                    switch(name) {
                        case "has":
                            return target.hasOwnProperty;
                        case "onUpdate":
                            return self.onDataUpdate;
                        default:
                            if (!target.hasOwnProperty(name)) return undefined;
                            return target[name];
                    }
                },
                set(target, property, value, receiver) {
                    target[property] = value;
                    self.onDataUpdate.next(property);
                    return true;
                }
            });
            /** @type {Scope} */
            this.parent = null;
            ref.jsFairScope = this;
        }
        setData(data) {
            let self = this;
            if (!data) throw "##";
            for (let prop in data) {
                if (!data.hasOwnProperty(prop)) continue;
                if (typeof data[prop] === "object") {
                    if (data[prop] instanceof Rx.Observable) {
                        //link pipe
                        this._data[prop] = null;
                        observerHandler(data, prop);
                        continue;
                    }
                }
                this._data[prop] = data[prop];
                this.onDataUpdate.next(prop);
            }
            function observerHandler(data, prop) {
                data[prop].subscribe((d) => {
                    self.data[prop] = d;
                });
            }
        }

        resolveOnComps(property) {
            if (this.type === "comp" && this.context.hasOwnProperty(property))
                return this.context[property];
            return (this.parent)? this.parent.resolveOnComps(property): undefined;
        }
        resolve(property) {
            let parts;

            if (typeof property === "string") {
                let isFunc = property.indexOf("(") > -1;
                if (isFunc) {
                    let match = /(\w*[^()])+\((.*)\)$/.exec(property);
                    //resolve function name
                    let func = this.resolveOnComps(match[1]);
                    //resolve all arguments
                    let args = match[2].split(",");
                    let resolvedArgs = [];
                    for (let arg of args) {
                        resolvedArgs.push(this.resolve(arg) );
                    }
                    //run function
                    return func.apply(null, resolvedArgs);
                }
                parts = (Array.isArray(property))? property: property.split(".");
            } else {
                parts = property;
            }
            if (this.data.has(parts[0])) {
                let last = this.data[ parts[0] ];
                for (let i = 1; i < parts.length; i++) {
                    if (last === null || last === undefined) return undefined;
                    last = last[ parts[i] ];
                }
                return last;
            } else {
                // console.log("resolve -> next");
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
        /**
         * @returns {Component}
         */
        getComp() {
            if (this.ref.hasOwnProperty("jsFairComponent"))
                return this.ref.jsFairComponent;
            else if (this.parent)
                return this.parent.getComp();
        }
        destroy() {
            this.parent.destroyChild(this);
        }
        _destroy() {
            this.destroyAllChilds();
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
                data: this._data
            };
        }
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
                    if (tagName) {
                        tagName = tagName.toLowerCase();
                        if (Components.hasOwnProperty(tagName)) {
                            initComp(node, scope, []);
                            node = node.nextSibling;
                            continue;
                        }
                    }
                    for (let i = 0; i < node.attributes.length; i++) {
                        let name = node.attributes[i].name;
                        if (name.charAt(0) !== "#") continue;
                        initDirective(name, node, node.attributes[i].nodeValue, scope);
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
            //@todo mark as deprecated
            return ctx;
        };

        let templatePath = false;
        if (typeof Components[componentName] === "object" && Components[componentName].hasOwnProperty("templatePath")) {
            templatePath = Components[componentName].templatePath;
        }

        getTemplate(componentName, templatePath, (template) => {
            Components[componentName].init.call(ctx, global, $(template), args);
            initSubTree(template, compScope);
            node.appendChild(template);

            if (ctx.hasOwnProperty("onLoad") && typeof ctx.onLoad === "function") {
                ctx.onLoad($(node));
            }
        });
    }
    global.initComp = initComp;

    window.onload = function() {
        rootScope = new Scope(document.body, {onDestroy() {}}, "ROOT");
        //init modules
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
                    let context = {};
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
    window.jsFair.Scope = Scope;
    window.jsFair.Component = Component;
    window.jsFair.BaseComponent = BaseComponent;

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
    node.innerHTML = '';
    while (template.firstChild.nodeType !== 1) {
        template.removeChild(template.firstChild);
    }

    //attr auslesen
    let a = attr.match(/(\w*) (of|in|on) (\w*)/);
    if (a.length !== 4) throw "Error in #for";//@notLive
    let _data = scope.resolve(a[3]) || [];
    let forScope = new jsFair.Scope(node, {onDestroy: discard}, "#for", a[3]);
    scope.add(forScope);
    redraw();

    scope.data.onUpdate.subscribe((prop) => {
        //@todo if dynamic update sub scopes
        if (prop === a[3] ) redraw();
    });
    //@todo add modes (dynamic)
    // function add(items) {}
    // function remove(items) {}
    function redraw() {
        //@todo remove old scopes from scope
        forScope.destroyAllChilds();
        _data = scope.resolve(a[3]);
        if (!Array.isArray(_data)) return;
        let fragment = document.createDocumentFragment();
        for (let i = 0; i < _data.length; i++) {
            let subFrag = template.cloneNode(true);
            // blockScope[a[1]] = data[i];
            // scopeStack.push(blockScope);
            let itemScope = new jsFair.Scope(subFrag.firstChild, {onDestroy() {}}, a[1], "["+i+"]");
            itemScope.data[a[1]] = _data[i];
            forScope.add(itemScope);
            // debugger;
            jsFair.global.initSubTree(subFrag, itemScope);
            // initDirectivesR(subFrag, ctx, scopeStack);
            fragment.append(subFrag);
        }
        node.innerHTML = "";
        node.append(fragment);
    }
    function discard() {

    }
});
defineDirective({ name: "#on" }, function (node, attr, scope) {
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
    //attr auslesen
    let comp = scope.getComp();
    let events = attr.split("::");
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
        // if (match.length !== 4) throw "Error in #for";//@notLive
        // while ((match = /(\w*):(\w*)\(([\w,\s.]*)\)/g.exec(attr)) != null) {}
        let eventType = e[0];
        let eventHandler = match[1];
        let eventHandlerArgs = match[2].replace(/\s/g, '').split(",");
        node.addEventListener(eventType, function (e) {
            let targetNode = node;
            let targetScope = scope;
            if (isFilter) {
                targetNode = hasParent(e.target, filter);
                if (targetNode.hasOwnProperty("jsFairScope") ) targetScope = targetNode.jsFairScope;
                // console.dir(targetNode)
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
});
defineDirective({ name: "#data" }, function (node, attr, scope) {
    let a = attr.split(":");
    if (a.length !== 2) throw "Error in #data";//@notLive

    node.dataset[a[0]] = scope.resolve(a[1]);
    node.removeAttribute("#data");
    scope.data.onUpdate.subscribe((prop) => {
        if (prop === a[1].split(".")[0] ) node.setAttribute(a[0], scope.resolve(a[1]) );
    });
});
defineDirective({ name: "#value" }, function (node, attr, scope) {
    node.value = scope.resolve(attr);
    scope.data.onUpdate.subscribe((prop) => {
        if (prop === attr.split(".")[0] ) node.value = scope.resolve(attr);
    });
});