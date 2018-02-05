(function() {
    "use strict";

    define("sections", function(global) {
        this.get = (sectionName) => {
            return $('section#' + sectionName).data("context");
        };
        this.load = (sectionID, compName, args) => {
            let $section = $('section#' + sectionID);
            if ($section.length === 0) {
                console.error("section with id '%s' not found!", sectionID);
            }
            let comp = $section.getComponent();
            return comp.load(compName, args);
        };
    });
    defineComp("section", function (global, $element) {
        let sectionID = $element.attr("id");
        let isStatic = !!$element.attr("static");
        let _compName = $element.attr("static") || $element.attr("default");
        let $loadendComp;
        let persistentComps = new Map();
        let persistent = !!$element.attr("persistent");

        if (!sectionID || sectionID === "") {
            console.log($element);
            throw new Error("section need id!");
        }

        if (_compName) {
            //load default or static comp
            let $comp = $("<" + _compName + ">");
            $element.append($comp);
        }

        this.onLoad = () => {};
        this.load = (compName, args) => {
            if (isStatic) {
                console.warn("section '%s' is static", sectionID);
                return;
            }
            if (persistent && $loadendComp) {
                $loadendComp.detach();
            } else {
                $element.empty();
            }
            _compName = compName;
            let $comp;
            if (persistent && persistentComps.has(compName)) {
                //laode this one
                $loadendComp = persistentComps.get(compName);
                $element.append($loadendComp);
            } else {
                $loadendComp = $("<" + compName + ">");
                if (persistent) persistentComps.set(compName, $loadendComp);
                $element.append($loadendComp);
                global.loadComponent($loadendComp, null, args);
            }
        };
        this.disableSection = () => {
            //
        }
        // this.componentType = () => {
        //     return
        // };
        // this.getComponent = () => {
        //     return
        // };

    }, {});
})();

