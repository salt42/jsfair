(function() {
    "use strict";
    let _sectionNames = [];

    defineComp("section", function (global, $element) {
        let name = $element.getName();
        let staticComp = $element.attr("static");
        let comp = $element.attr("default");
        if (!name || name === "") {
            throw new Error("section need name!");
        }


        //load default comp
        global.loadComponent("gMap");
        this.onLoad = () => {};

    }, {});
})();

