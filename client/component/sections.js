(function() {
    "use strict";

    define("Section", function(global) {
        /**
         * @namespace Global
         * @property {object} Section
         */
        /**
         * @memberOf Global.Section
         * @param {string} sectionName
         * @returns {bool|Component}
         */
        this.get = (sectionName) => {
            let sectionCtx = $('section#' + sectionName).data("context");
            if (!sectionCtx) {
                console.warn("no section with this id");
                return false;
            }
            return sectionCtx.getComponent();
        };
        /**
         * @memberOf Global.Section
         * @param sectionID
         * @param compName
         * @param args
         * @param fn
         * @returns {Promise<any>}
         */
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
        let self = this;
        global.sections = {
            get(...args) {
                console.warn("global.sections.get() is deprecated. Use global.Section.get() instead.");
                self.get(...args);
            },
            load(...args) {
                console.warn("global.sections.load() is deprecated. Use global.Section.load() instead.");
                self.load(...args);
            }
        };
    });
    defineComp("section", function (global, template) {
        let $element = this.$ele;
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
            $loadedComp = $("<" + _compName + ">");
            template.append($loadedComp);
        }

        this.onLoad = () => {};
        this.load = (compName, args, fn) => {
            if(typeof args === "function"){
                fn = args;
                args = null;
            }
            if (_compName === compName) {
                if (typeof fn === "function") fn();
                return;
            }
            if (persistent && $loadedComp) {
                $loadedComp.detach();//@todo set scope to detached
            } else {
                global.removeNode($loadedComp);
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
            if (!$loadedComp || !$loadedComp.length) return false;
            return $loadedComp.getComponent();
        };
        this.disableSection = () => {
            //
        }

    }, {});
})();

