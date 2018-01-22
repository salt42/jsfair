(function() {
    "use strict";

    defineComp("split-section", function (global, $element) {
        let sectionID = $element.attr("id");
        let _compNames = $element.attr("default");

        let $compOne;
        let $compTwo;

        if (!sectionID || sectionID === "") {
            throw new Error("section need id!");
        }

        if (_compNames) {
            //load default
            let comps = _compNames.split(",");
            $compOne = $("<" + comps[0] + ">");
            $(".item.one", $element).append($compOne);
            $compTwo = $("<" + comps[1] + ">");
            $(".item.two", $element).append($compTwo);
        }



        // let dragged;
        // $(".handle", $element).mousedown(function(e) {
        //     console.log("drag", e);
        //     dragged = e;
        //     // e.target.style.opacity = .5;
        // });
        // $(document).mousemove(function(e) {
        //     if (dragged) {
        //         console.log(dragged, "mousemove", e);
        //
        //     }
        //     // if ()
        //     // console.log("mouseMove");
        //     // dragged = e.target;
        //     // e.target.style.opacity = .5;
        // });
        // $(document).mouseup(function(e) {
        //     console.log("mouseup", e);
        //     dragged = null;
        //     // console.log("mouseUp");
        //     // dragged = e.target;
        //     // e.target.style.opacity = .5;
        // });

        this.onLoad = () => {};
        this.load = (compName) => {
            // //@todo unload current comp
            // _compName = compName;
            // $element.empty();
            // let $comp = $("<" + compName + ">");
            // $element.append($comp);
            // global.loadComponent($comp, (ctx) => {
            //
            // });
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

    }, {
        templatePath: "/jsfair/component/splitSection/splitSection.html"
    });
})();

