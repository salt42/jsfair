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
     * @property {jQuery|HTMLElement} $chatBox
     */
    const global = {};
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
     * @param compName
     * @param {CompInitCallback} initMethod
     * @param opt
     */
    window.defineComp = function(compName, initMethod, opt) {
        compName = compName.toLowerCase();
        if(Components.hasOwnProperty(compName)) {
            console.error("Component name '"+ compName +"' already taken");
        }
        let compMeta = {
            name: compName,
            init: initMethod
        };
        ComponentNames.push(compName);
        if (typeof opt === "object") {
            compMeta.templatePath = opt.templatePath || null
        }

        Components[compName] = compMeta;
    };

    function getTemplate(componentName, templatePath, fn) {
        let template = document.head.querySelector("#template-" + componentName + "-main");
        if (template && !DEV) {
            // let ele = document.importNode(template.content, true);
            fn(template)
        } else {
            if (!templatePath) {
                fn(null);
                return;
            }
            //@todo try to load it
            if (TemplateCache.has(templatePath)) {
                fn(TemplateCache.get(templatePath));
            } else {
                $.ajax({
                    url: templatePath
                })
                .then(function (res) {

                    // TemplateCache.add(templatePath, res);
                    let frag = document.createDocumentFragment();
                    frag.innerHTML(res);

                    fn({
                        content: frag,
                    });
                }, function (e) {
                    fn(null);
                });
            }
        }
    }

    /* GLOBAL */
    global.onModulesLoaded = new Rx.ReplaySubject();
    global.onPageLoaded = new Rx.ReplaySubject();
    global.onComponentLoaded = new Rx.ReplaySubject();
    global.loadSubComponents = ($ele) => {
        return loadSubComps($ele[0])
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
        let a = loadComp($element[0], args);
        a.then(function() {
            if (typeof fn === "function") fn();
        }, function (e) {
            console.error("Component loading error!");
            throw e;
            // console.trace(e);
        })
    };

    class Component {
        /**
         * @param {string} name
         */
        constructor(name) {
            this.name = name;
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
    }
    function loadSubComps(ele) {
        let promises = [];
        for (let i = 0; i < ele.childNodes.length; i++) {
            let tagName = ele.childNodes[i].tagName;
            if (!tagName) continue;
            // console.log("search comp:", tagName);
            tagName = tagName.toLowerCase();
            //check if comp
            if (Components.hasOwnProperty(tagName)) {
                //load comp
                promises.push(loadComp(ele.childNodes[i]) );
            } else {
                //recursive step into
                promises.push(loadSubComps(ele.childNodes[i]) );
            }
        }
        return Promise.all(promises);
    }
    function loadComp(ele, args) {
        return new Promise(
            function(resolve, reject) {
                try {
                    let componentName = ele.tagName.toLowerCase();
                    componentName = componentName.toLowerCase();
                    if (ele.isComponent) {
                        resolve();
                        return;
                    }
                    if (!Components.hasOwnProperty(componentName)) {
                        console.error("no component with name '%s'", componentName);
                        resolve();
                    }
                    let ctx = new Component(componentName);
                    ctx.$ele = $(ele);
                    $(ele).data("context", ctx);
                    // ele.context = ctx;
                    ele.isComponent = true;
                    ele.getComponent = () => {
                        return ctx;
                    };

                    let templatePath = false;
                    if (typeof Components[componentName] === "object" && Components[componentName].hasOwnProperty("templatePath")) {
                        templatePath = Components[componentName].templatePath;
                    }

                    getTemplate(componentName, templatePath, (template) => {
                        ctx.template = template;
                        if (!template) {
                            Components[componentName].init.call(ctx, global, $(ele), args);
                            loadSubComps(ele).then(() => {
                                if (ctx.hasOwnProperty("onLoad") && typeof ctx.onLoad === "function") {
                                    ctx.onLoad();
                                }
                                //global.onComponentLoaded.next(componentName);
                                resolve();
                            });
                        } else {
                            Components[componentName].init.call(ctx, global, template.content, args);
                            let imported = document.importNode(template.content, true);
                            $(ele).append(imported);
                            loadSubComps(ele).then(() => {
                                if (ctx.hasOwnProperty("onLoad") && typeof ctx.onLoad === "function") {
                                    ctx.onLoad($(ele));
                                }
                                //global.onComponentLoaded.next(componentName);
                                resolve();
                            });
                        }
                    });
                } catch(e) {
                    reject(e);
                }
            });
    }
    window.onload = function() {
        //init modules
        for(let module in Modules) {
            if (!Modules.hasOwnProperty(module)) continue;
            let context = {};
            Modules[module].call(context, global);
            global[module] = context;
        }
        global.onModulesLoaded.next();

        // load components
        let a = loadSubComps($("body")[0]);
        a.then(function() {
            global.onPageLoaded.next();
            // console.log("page loaded");
        }, function () {
            // console.log("loading error"); //solte eigentlich nicht vorkommen
        })
    };
})();
