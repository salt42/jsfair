(function() {
    "use strict";

    define("sections", function(global) {
        this.get = (sectionName) => {
            let sectionCtx = $('section#' + sectionName).data("context");
            if (!sectionCtx) {
                console.warn("no section with this id");
                return false;
            }
            return sectionCtx.getComponent();
        };
        this.load = (sectionID, compName, args, fn) => {
            return new Promise(function(resolve, reject) {
                if(typeof args === "function"){
                    fn = args;
                    args = null;
                }
                let $section = $('section#' + sectionID);
                if ($section.length === 0) {
                    console.error("section with id '%s' not found!", sectionID);
                }
                let comp = $section.getComponent();
                comp.load(compName, args, function (...args) {
                    if (typeof fn === "function") fn();
                    resolve(...args);
                });
            });
        };
    });
    defineComp("section", function (global, $element) {
        let sectionID = $element.attr("id");
        let isStatic = !!$element.attr("static");
        let _compName = $element.attr("static") || $element.attr("default");
        let $loadedComp;
        let persistentComps = new Map();
        let persistent = !!$element.attr("persistent");

        if (!sectionID || sectionID === "") {
            console.log($element);
            throw new Error("section need id!");
        }
        //was schade ist is das ich keinen weg gefunden hab eigene templates anzulegen
        if (_compName) {
            //load default or static comp
            let $comp = $("<" + _compName + ">");
            $element.append($comp);
        }

        this.onLoad = () => {};
        this.load = (compName, args, fn) => {
            if(typeof args === "function"){
                fn = args;
                args = null;
            }
            if (_compName === compName) {
                fn();
            }
            //@todo check if comp exists
            if (persistent && $loadedComp) {
                $loadedComp.detach();
            } else {
                $element.empty();
            }
            _compName = compName;
            if (persistent && persistentComps.has(compName)) {
                //laode this one
                $loadedComp = persistentComps.get(compName);
                $element.append($loadedComp);
            } else {
                $loadedComp = $("<" + compName + ">");
                if (persistent) persistentComps.set(compName, $loadedComp);
                $element.append($loadedComp);
                global.loadComponent($loadedComp, fn, args);
            }
        };
        this.getComponent = () => {
            if (!$loadedComp && !$loadedComp.length) return false;
            return $loadedComp.getComponent();
        };
        this.disableSection = () => {
            //
        }

    }, {});
})();

