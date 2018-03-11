//core
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
        if (this.length === 0 || !this[0].isComponent) {
            return false;
        }
        return this[0].getComponent();
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
        Components = {},
        ComponentNames = [],
        loadingCompsCtx = [],
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

    //defines a core module
    window.define = function(moduleName, initMethod) {
        if(Modules.hasOwnProperty(moduleName)) {
            console.error("Module name '"+ moduleName +"' already taken");
        }
        Modules[moduleName] = initMethod;
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

    function getTemplate(componentName, templatePath, fn) {
        let template = document.head.querySelector("#template-" + componentName + "-main");
        if (template && !DEV) {
            // let ele = document.importNode(template.content, true);
            fn(template.content);
        } else {
            fn(document.createDocumentFragment());
        }
    }

    /* GLOBAL */
    global.onModulesLoaded = new Rx.ReplaySubject();
    global.onPageLoaded = new Rx.ReplaySubject();
    global.onComponentLoaded = new Rx.ReplaySubject();
    global.loadSubComponents = ($ele) => {
        console.error("deprecated ")
        // return loadSubComps($ele[0])
    };
    global.getActiveComponent = function(sectionName) {
        let $section = $('section[name="'+ sectionName +'"]');
        if ($section.length < 0) {
            throw new Error("section with name '"+ sectionName+"' not found");
        }
        return $section.data("context");
    };

    //@todo overwriteable error functions    think through
    global.error = function(id, title, msg) {
        throw new Error(msg);
    };
    global.fatalError = function(msg) {
        throw new Error(msg);
    };

    /**
     * @memberOf Global
     * @param {jQuery} $element
     * @param {function} fn
     * @param args
     */
    global.loadComponent = function($element, fn, args) {
        let scope = getScope($element[0]);
        initComp($element[0], scope, args);
    };
    function getScope(element) {
        while(element = element.parentNode) {
            if (element.hasOwnProperty("jsFairScope") ) return element.jsFairScope;
        }
    }
    function walkDOM(node, func) {
        func(node);
        node = node.firstChild;
        while (node) {
            walkDOM(node, func);
            node = node.nextSibling;
        }
    }
    function arrayDiff(a, b) {
        return a.filter(function(i) {return b.indexOf(i) < 0;});
    }
    function fragmentFromString(strHTML) {
        return document.createRange().createContextualFragment(strHTML);
    }
    let directives = [
        {
            name: "#for",
            /**
             * @param node
             * @param attr
             * @param {Scope} scope
             */
            init: function(node, attr, scope) {
                let template = fragmentFromString(node.innerHTML);
                node.innerHTML = '';
                let blockScope = {};
                //attr auslesen
                let a = attr.match(/(\w*) (of|in|on) (\w*)/);
                if (a.length !== 4) throw "Error in #for";//@niLive
                let _data = scope.resolve(a[3]) || [];
                redraw();
                //@todo check array
                // redraw(_data);

                scope.data.onUpdate.subscribe((prop) => {
                    if (prop === a[3] ) {
                        //compare data and
                        // console.log(scope.data[a[3]], a[3], _data);
                        // console.log(scope, a[3], scope.resolve(a[3]));
                        // if (!_data) {
                        //     _data = scope.resolve(a[3]);
                            redraw();
                        // } else {
                        //     let newItems = arrayDiff(scope.data[a[3]], _data);
                        //     let removeItems = arrayDiff(_data, scope.data[a[3]]);
                        //     console.log("changed", newItems, removeItems);
                        //
                        //     // redraw(_data);
                        // }
                    }
                });
                function add(items) {}
                function remove(items) {}
                function redraw() {
                    _data = scope.resolve(a[3]);
                    let fragment = document.createDocumentFragment();
                    for (let i = 0; i < _data.length; i++) {
                        let subFrag = template.cloneNode(true);
                        // blockScope[a[1]] = data[i];
                        // scopeStack.push(blockScope);
                        let itemScope = new Scope(subFrag.firstChild);
                        itemScope.data[a[1]] = _data[i];
                        scope.add(itemScope);
                        initSubTree(subFrag, itemScope);
                        // initDirectivesR(subFrag, ctx, scopeStack);
                        fragment.append(subFrag);
                    }
                    node.innerHTML = "";
                    node.append(fragment.cloneNode(true));
                }
                function readCtxData(ctx, prop) {
                    if (blockScope.hasOwnProperty(prop)) return blockScope[prop];
                    return ctx.data[prop];
                }
            }
        },
        {
            name: "#text",
            /**
             * @param node
             * @param attr
             * @param {Scope} scope
             */
            init: function(node, attr, scope) {
                //parse and split text
                let re = /\{\{(.*?)\}\}/g;
                let match;
                let staticParts = [];
                let properties = [];
                let lastIndex = 0;

                // console.log(node)
                if (!node.textContent.match(re) ) {
                    return;
                }
                while ((match = re.exec(node.textContent)) != null) {
                    staticParts.push(node.textContent.substring(lastIndex, match.index));
                    properties.push(match[1]);
                    lastIndex = lastIndex + match[0].length;
                }
                // console.log("new text:", staticParts, properties)
                function update() {
                    let res = "";
                    for (let i = 0; i < staticParts.length; i++) {
                        let v = scope.resolve(properties[i]);
                        res += staticParts[i] + ((v === undefined) ? "{{" + properties[i] + "}}": scope.resolve(properties[i]) );
                    }
                    // console.log(properties, scopeStack, ctx.data);
                    // console.log(res);
                    // console.log(res)
                    node.textContent = res;
                }
                update();
                scope.data.onUpdate.subscribe((prop) => {
                    // if (prop === "" ) {
                    // console.log("update text")
                    update();
                    //rerender text and add to element

                    // }
                });
            }
        },
        {
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
    ];
    let directivesNames = [
        "#for",
        "#text",
        "#css"
    ];
    function initDirective(name, node, attr, scope) {
        let index = directivesNames.indexOf(name);
        if (index < 0) return;
        //@todo if (!attr) attr = node.attributes[name]
        directives[index].init(node, attr, scope);
    }
    class BaseComponent {
        constructor(name) {
            // this.data = Object.create({
            //     set(key, value) {
            //         if (typeof key === "string") {
            //             if (typeof value === "function") {
            //
            //             }
            //         } else if (typeof  key === "object") {
            //             //flush all
            //         }
            //     }
            // }, {});
        }
    }
    class Component extends BaseComponent {
        /**
         * @param {string} name
         * @param {Scope} scope
         */
        constructor(name, scope) {
            super(name);
            this.name = name;
            this.scope = scope;
            this.data = scope.data;
            this.$ele = null;
            this.template = null;
        }
        //@overwrite
        onLoad() {}
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
    }
    class Scope {
        constructor(ref) {
            let self = this;
            this.onDataUpdate = new Rx.Subject();
            this._data = {};
            this.ref = ref;
            this.children = [];
            this.data = new Proxy(this._data, {
                get: function(target, name) {
                    switch(name) {
                        case "has":
                            return target.hasOwnProperty;
                        case "onUpdate":
                            return self.onDataUpdate;
                        default:
                            if (!target.hasOwnProperty(name)) return;
                            return target[name];
                    }
                    // return function(...args) {
                    //     if (name === "init") return init(...args);
                    //     if (dbMethods.hasOwnProperty(name) && typeof dbMethods[name] === "function") {
                    //         return dbMethods[name].call(dbMethods, ...args);
                    //     } else {
                    //         let e = new Error(("No function registered with name: " + name).red);
                    //         log(e.stack);
                    //     }
                    // }
                },
                apply(target, thisArg, argumentsList) {
                    // if (argumentsList.length < 1) throw "##";
                    // //set data
                    // let data = argumentsList[0];
                    // let props = [];
                    // for (let prop in data) {
                    //     if (!data.hasOwnProperty(prop)) continue;
                    //     props.push(props);
                    //     if (typeof data[prop] === "object") {
                    //         if (data[prop] instanceof Rx.Observable) {
                    //             //link pipe
                    //             target[prop] = null;
                    //             observerHandler(data, prop);
                    //             continue;
                    //         }
                    //     }
                    //     target[prop] = data[prop];
                    // }
                    // // console.log(data)
                    // // console.dir(target)
                    // self.onDataUpdate.next(props);
                    // function observerHandler(data, prop) {
                    //     data[prop].subscribe((d) => {
                    //         //set data
                    //         target[prop] = d;
                    //         onDataUpdate.next(prop);
                    //     })
                    // }
                },
                set(target, property, value, receiver) {
                    target[property] = value;
                    self.onDataUpdate.next(property);
                    return true;
                },
                has() {},
                // apply(target, thisArg, argumentsList) {
                //     //@todo call method on component context or in data?
                //     return;
                // },
                construct() { throw "It's not allowed to instantiate data" }
            });
            /** @type {Scope} */
            this.parent = null;
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
            // console.log(data)
            // console.dir(this._data)
            function observerHandler(data, prop) {
                data[prop].subscribe((d) => {
                    //set data
                    self.data[prop] = d;
                    // self.onDataUpdate.next(prop);
                })
            }
        }
        resolve(property) {
            // console.log("resolve", property, this.data);
            let parts = (Array.isArray(property))? property: property.split(".");
            if (this.data.has(parts[0])) {
                let last = this.data[ parts[0] ];

                for (let i = 1; i < parts.length; i++) {
                    // if (last.hasOwnProperty(parts[i])) return undefined;
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
    }

    function initSubTree(node, scope) {
        node = node.firstChild;
        while (node) {
            switch(node.nodeType) {
                case 1:
                    let tagName = node.tagName;
                    if (tagName) {
                        tagName = tagName.toLowerCase();
                        //check if comp
                        if (Components.hasOwnProperty(tagName)) {
                            //load comp
                            // loadComp(node, [], scope);
                            initComp(node, scope, []);
                            // initSubTree(node, scope);
                            // return; //@todo??
                        } else {
                            initSubTree(node, scope);
                        }
                    }
                    for (let i = 0; i < node.attributes.length; i++) {
                        let name = node.attributes[i].name;
                        if (name.charAt(0) !== "#") continue;
                        initDirective(name, node, node.attributes[i].nodeValue, scope);
                    }
                    break;
                case 3:
                    initDirective("#text", node, null, scope);
                    break;
                case 11:
                    //document fragment
                    console.log("document");
                    break;
                default:
                    initSubTree(node, scope);
            }
            node = node.nextSibling;
        }
    }

    function initComp(node, scope, args) {
        let componentName = node.tagName.toLowerCase();
        componentName = componentName.toLowerCase();
        if (node.jsFairComponent) return;
        if (!Components.hasOwnProperty(componentName)) throw ("no component with name: " + componentName);

        let compScope = new Scope(node);
        scope.add(compScope);
        let ctx = new Component(componentName, compScope);
        ctx.$ele = $(node);
        $(node).data("context", ctx);//@todo deprecated
        node.jsFairComponent = ctx;
        node.jsFairScope = compScope;
        node.getComponent = () => {
            return ctx;
        };

        let templatePath = false;
        if (typeof Components[componentName] === "object" && Components[componentName].hasOwnProperty("templatePath")) {
            templatePath = Components[componentName].templatePath;
        }

        getTemplate(componentName, templatePath, (template) => {
            Components[componentName].init.call(ctx, global, $(template), args);
            initSubTree(template, compScope);
            node.append(template);

            if (ctx.hasOwnProperty("onLoad") && typeof ctx.onLoad === "function") {
                ctx.onLoad($(node));
            }
            //global.onComponentLoaded.next(componentName);

        });
    }

    window.onload = function() {
        rootScope = new Scope(document.body);
        //init modules
        for(let module in Modules) {
            if (!Modules.hasOwnProperty(module)) continue;
            let context = {};
            Modules[module].call(context, global);
            global[module] = context;
        }
        global.onModulesLoaded.next();

        // load components
        console.time("krass")
        initSubTree(document.body, rootScope);
        console.timeEnd("krass")
        global.onPageLoaded.next();
        window.G = {
            rootScope: rootScope
        };
    };
})();
