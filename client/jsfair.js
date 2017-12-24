//core
(function() {
    "use strict";

    const global = {};
    let Modules = {},
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

    let loadingCompsCtx = [];
    global.loadComponent = function(componentName, sectionName, args) {
        loadingCompsCtx = [];
        loadComponentInSection(componentName, sectionName, args, function() {
            initLoadedComps();
        });
    };
    function initLoadedComps() {
        for(let i = 0; i < loadingCompsCtx.length; i++) {
            let compCtx = loadingCompsCtx[i];
            if (compCtx.hasOwnProperty("onLoad") && typeof compCtx.onLoad === "function") {
                compCtx.onLoad();
            }
        }
        loadingCompsCtx = [];
    }
    function loadComponent(componentName, $element, fn) {
        if ($element.data("context") ) {
            fn();
            return;
        }
        let template = Components[componentName].templatePath;
        let ctx = {};
        loadingCompsCtx.push(ctx);
        $element.data("context", ctx);

        if (template) {
            getTemplate(template, (data) => {
                $element.html(data).promise().done(function(){
                    loadComponents($element, function() {
                        if(typeof fn === "function") fn();
                    });
                    Components[componentName].init.call(ctx, global, $element);
                    global.onComponentLoaded.next(componentName);
                });
            });
        } else{
            Components[componentName].init.call(ctx, global, $element);
            if(typeof fn === "function") fn();
            global.onComponentLoaded.next(componentName);
        }
    }
    function loadAllComponents($container, fn) {
        let count = 0;
        $(ComponentNames.join(", "), $container).each(function(index, value) {
            let compName = value.tagName.toLowerCase();
            count++;
            loadComponent(compName, $(value), () => {
                count--;
                if (count < 1) {
                    fn();
                }
            });
        });
        // count--;
        if (count < 1) {
            fn();
        }
    }



    function loadComponentInSection(componentName, sectionName, args, fn) {
        if (!Components.hasOwnProperty(componentName)) {
            throw Error("component with name '"+ componentName +"' not found");
        }
        let $section = $('section[name="'+ sectionName +'"]');
        if ($section.length === 0) {
            throw Error("section with name '"+ sectionName +"' not found");
        }
        $section = $($section[0]);
        //unload current component
        let oldCtx = $section.data("context");
        if (oldCtx && oldCtx.hasOwnProperty("onDiscard") && typeof oldCtx.onDiscard === "function") {
            oldCtx.onDiscard.call(oldCtx);
        }

        $section.empty();
        $section.removeClass();
        $section.addClass(componentName);
        $.removeData($section, "context");
        loadComponent(componentName, $section, () => {
            //load sub components
            fn();
        });
    }
    function loadComponents($container, fn) {
        let sections = [];
        let $sections = $("section", $container);
        let count = 1;
        // step 2
        let loadComponentTags = () => {
            let count = 0;
            $(ComponentNames.join(", "), $container).each(function(index, value) {
                let compName = value.tagName.toLowerCase();
                count++;

                loadComponent(compName, $(value), () => {
                    count--;
                    if (count < 1) {
                        fn();
                    }
                });
                // loadComponent
            });
            // count--;
            if (count < 1) {
                fn();
            }
        };
        // step 1
        for(;count < $sections.length + 1; count++) {
            let sectionName = $($sections[count - 1]).attr("name"),
                defaultComp = $($sections[count - 1]).attr("default").toLowerCase();

            if (!sectionName) {
                console.error("show error section's need a name attribute");
                return;
            }
            //check if section name is already taken
            if (sections.indexOf(sectionName) > -1) {
                console.error("there are duplicate sections with name '" + sectionName + "'", sections);
                return;
            }
            sections.push(sectionName);
            if (defaultComp) {
                if (!Components.hasOwnProperty(defaultComp)) {
                    console.error("no component with this name");
                    return;
                }
                //loadComp
                loadComponentInSection(defaultComp, sectionName, {}, function () {
                    count--;
                    if (count < 1) {
                        loadComponentTags();
                    }
                });
            }
        }
        count--;
        if (count < 1) {
            loadComponentTags();
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
        loadingCompsCtx = [];
        loadComponents($("body"), function() {
            initLoadedComps();
        });
    };
})();

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