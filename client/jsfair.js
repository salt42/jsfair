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

    function getTemplate(componentName, templatePath, fn) {
        let template = document.head.querySelector("#template-" + componentName + "-main");
        if (template) {
            let ele = document.importNode(template.content, true);
            fn(ele)
        } else {
            fn();
        }
        return;
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

    global.loadComponent = function($element, fn, args) {
        let a = loadComp($element[0], args);
        a.then(function() {
            if (typeof fn === "function") fn();
        }, function () {
            console.error("Component loading error!");
            console.trace();
        })
    };

    class Component {
        constructor(name) {
            this.name = name;
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
                let componentName = ele.tagName.toLowerCase();
                // console.log("load comp:", componentName);
                componentName = componentName.toLowerCase();
                if (ele.isComponent ) {
                    resolve();
                    return;
                }
                if (!Components.hasOwnProperty(componentName)) {
                    console.error("no component with name '%s'", componentName);
                    resolve();
                }
                let template = false;

                if (typeof Components[componentName] === "object" && Components[componentName].hasOwnProperty("templatePath")) {
                    template = Components[componentName].templatePath;
                }
                let ctx = new Component(componentName);
                $(ele).data("context", ctx);
                // ele.context = ctx;
                ele.isComponent = true;
                ele.getComponent = () => {
                    return ctx;
                };
                if (template) {
                    getTemplate(componentName, template, (template) => {
                        // ele.addEventListener('DOMContentLoaded', function() {
                        //     fn();
                        // });
                        //@todo move html injection to getTemplate and place the html in a template tag.
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
                            Components[componentName].init.call(ctx, global, $(template), args);
                            $(ele).append(template);
                            loadSubComps(ele).then(() => {
                                if (ctx.hasOwnProperty("onLoad") && typeof ctx.onLoad === "function") {
                                    ctx.onLoad();
                                }
                                //global.onComponentLoaded.next(componentName);
                                resolve();
                            });
                        }
                    });
                } else {
                    Components[componentName].init.call(ctx, global, $(ele), args);
                    loadSubComps(ele).then(() => {
                        if (ctx.hasOwnProperty("onLoad") && typeof ctx.onLoad === "function") {
                            ctx.onLoad();
                        }
                        //global.onComponentLoaded.next(componentName);
                        resolve();
                    });
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
