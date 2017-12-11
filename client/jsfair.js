//core
(function() {
    "use strict";

    const global = {
        // UIModules: {}
    };
    let Modules = {},
        UIModules = {},
        Components = {},
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
        if(Components.hasOwnProperty(compName)) {
            console.error("Component name '"+ compName +"' already taken");
        }
        let compMeta = {
            name: compName,
            init: initMethod
        };

        if (typeof opt === "object") {
            compMeta.templatePath = opt.templatePath || null
        }

        Components[compName] = compMeta;
    };
    //defines a UI module
    window.defineUI = function(uiName, initMethod) {
        if(UIModules.hasOwnProperty(uiName)) {
            console.error("UI Module name '"+ uiName +"' already taken");
        }
        UIModules[uiName] = initMethod;
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

    function initUIModule(moduleName, $ele) {
        if (!UIModules.hasOwnProperty(moduleName)) return;
        let ctx = {};
        if ($ele.data("context") ) return;
        $ele.data("context", ctx);
        UIModules[moduleName].call(ctx, global, $ele);
    }

    global.getActiveComponent = function(sectionName) {
        let $section = $('section[name="'+ sectionName +'"]');
        if ($section.length < 0) {
            throw new Error("section with name '"+ sectionName+"' not found");
        }
        return $section.data("context");
    };



    global.initUI = function($element) {
        let moduleName = $element.prop("tagName").toLowerCase();
        if (!UIModules.hasOwnProperty(moduleName)) {
            //@todo error "element is not a uiModule"
            for(moduleName in UIModules) {
                if (!UIModules.hasOwnProperty(moduleName)) continue;
                $(moduleName, $element).each(function(index, ele) {
                    initUIModule(moduleName, $(ele));
                });
            }
            return;
        }
        initUIModule(moduleName, $element);
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
        loadComponent(componentName, sectionName, args, function() {
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


    function loadComponent(componentName, sectionName, args, fn) {
        console.log("load: " + componentName);
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
        let template = Components[componentName].templatePath;
        let ctx = {};

        loadingCompsCtx.push(ctx);
        $section.empty();
        $section.removeClass();
        $section.addClass(componentName);
        $section.data("context", ctx);

        if (template) {
            getTemplate(template, (data) => {
                $section.html(data).promise().done(function(){
                    global.initUI($section);
                    loadComponents($section, function() {
                        fn();
                    });
                    Components[componentName].init.call(ctx, global, $($section[0]), args);
                });
            });
        } else{
            Components[componentName].init.call(ctx, global, $($section[0]), args);
            fn();
        }
    }
    function loadComponents($container, fn) {
        let sections = [];
        let count = 1;
        let $sections = $("section", $container);

        for(;count < $sections.length + 1; count++) {
            let sectionName = $($sections[count - 1]).attr("name"),
                defaultComp = $($sections[count - 1]).attr("default");

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
                loadComponent(defaultComp, sectionName, {}, function () {
                    count--;
                    if (count < 1) {
                        fn();
                    }
                });
            }
        }
        count--;
        if (count < 1) {
            fn();
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
        // //init UI modules
        global.initUI($("body"));
        // load components
        loadingCompsCtx = [];
        loadComponents($("body"), function() {
            initLoadedComps();
        });
    };
})();