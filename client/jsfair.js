//core
(function( $ ) {
    $.fn.getComponent = function() {
        if (this.length === 0 || !this[0].isComponent) {
            return false;
        }
        return this[0].getComponent();
    };

}( jQuery ));
(function() {
    "use strict";

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
    //defines a component
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
    //defines a UI module
    window.defineUI = function(uiName, initMethod) {
        //@todo deprecated
        throw("defineUI is deprecated");
        // if(UIModules.hasOwnProperty(uiName)) {
        //     console.error("UI Module name '"+ uiName +"' already taken");
        // }
        // UIModules[uiName] = initMethod;
    };

    function getTemplate(templatePath, fn) {
        if (TemplateCache.has(templatePath)) {
            fn(TemplateCache.get(templatePath));
        } else {
            $.ajax({
                url: templatePath
            })
                .done(function (res) {
                    TemplateCache.add(templatePath, res);
                    fn(res);
                })
                .fail(function (e) {
                    //@todo error handling
                    console.log(e);
                });
        }
    }

    /* GLOBAL */
    global.onComponentLoaded = new Rx.Subject();

    global.getActiveComponent = function(sectionName) {
        let $section = $('section[name="'+ sectionName +'"]');
        if ($section.length < 0) {
            throw new Error("section with name '"+ sectionName+"' not found");
        }
        return $section.data("context");
    };
    global.initUI = function($element) {
        throw("initUI is deprecated");
    };
    global.initAllUI = function($parent) {
        throw("initAllUI is deprecated -> use initUI");
    };
    global.initUIin = function($parent) {
        throw("initAllUI is deprecated -> use initUI");
    };

    //@todo overwriteable error functions    think through
    global.error = function(id, title, msg) {
        throw new Error(msg);
    };
    global.fatalError = function(msg) {
        throw new Error(msg);
    };

    global.loadComponent = function($element, fn) {
        let compName = $element.prop("tagName").toLowerCase();
        loadComponent(compName, $element, (ctxArray) => {
            if (typeof fn === "function") fn(ctxArray[ctxArray.length - 1]);
        });
    };
    function initComponents(ctxArray) {
        // for(let i = 0; i < ctxArray.length; i++) {
        //     let compCtx = ctxArray[i];
        //     if (compCtx.hasOwnProperty("onLoad") && typeof compCtx.onLoad === "function") {
        //         compCtx.onLoad();
        //     }
        // }
    }

    class Component {
        constructor(name) {
            this.name = name;
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
    }
    function loadComponent(componentName, $element, fn) {
        if ($element[0].isComponent ) {
            fn($element[0].getComponent());
            return;
        }
        let template = false;
        if (typeof Components[componentName] === "object" && Components[componentName].hasOwnProperty("templatePath")) {
            template = Components[componentName].templatePath;
        }
        let ctx = new Component(componentName);
        // $element.data("context", ctx);
        $element[0].isComponent = true;
        $element[0].getComponent = () => {
            return ctx;
        };
        if (template) {
            getTemplate(template, (data) => {
                $element.html(data).promise().done(function(){
                    Components[componentName].init.call(ctx, global, $element);
                    loadAllComponents($element, function(ctxArray) {
                        ctxArray.push(ctx);
                        if(typeof fn === "function") fn(ctxArray);

                        if (ctx.hasOwnProperty("onLoad") && typeof ctx.onLoad === "function") {
                            ctx.onLoad();
                        }
                        global.onComponentLoaded.next(componentName);
                    });
                });
            });
        } else{
            Components[componentName].init.call(ctx, global, $element);
            loadAllComponents($element, function(ctxArray) {
                ctxArray.push(ctx);
                if(typeof fn === "function") fn(ctx);
                if (ctx.hasOwnProperty("onLoad") && typeof ctx.onLoad === "function") {
                    ctx.onLoad();
                }
                global.onComponentLoaded.next(componentName);
            });
        }
    }
    function loadAllComponents($container, fn) {
        let count = 0;
        let ctxArray = [];

        $(ComponentNames.join(", "), $container).each(function(index, value) {
            let compName = value.tagName.toLowerCase();
            count++;
            loadComponent(compName, $(value), (ctx) => {
                count--;
                ctxArray.push(ctx);
                if (count < 1) {
                    fn(ctxArray);
                }
            });
        });
        // count--;
        if (count < 1) {
            fn(ctxArray);
        }
    }

    window.onload = function() {
        //init modules
        for(let module in Modules) {
            if (!Modules.hasOwnProperty(module)) continue;
            let context = {};
            Modules[module].call(context, global);
            global[module] = context;
        }
        // load components
        loadAllComponents($("body"), function(ctxArray) {
            //@todo
        });
    };
})();
