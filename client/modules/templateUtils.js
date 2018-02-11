(function($) {
    "use strict";
    $.fn.appendTemplate = function(template, list, fn) {
        template = $(template)[0];
        if (!template) throw new Error("template not found!");
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let $ele = document.importNode(template.content, true);


        }
        return this[0].getComponent();
    };

}(jQuery));