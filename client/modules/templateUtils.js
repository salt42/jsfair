(function($) {
    "use strict";
    /**
     * The jQuery plugin namespace.
     * @external "jQuery.fn"
     * @see {@link http://docs.jquery.com/Plugins/Authoring The jQuery Plugin Guide}
     */

    /**
     * @function external:"jQuery.fn".appendTemplate
     * @param template
     * @param list
     * @param fn
     * @returns {jQuery}
     */
    $.fn.appendTemplate = function(template, list, fn) {
        template = $(template)[0];
        if (!template) throw new Error("template not '%s' found!", template);
        let rootFragment = document.createDocumentFragment();
        for (let i = 0; i < list.length; i++) {
            if(list[i].skip && list[i].skip === true) continue;
            let subFrag = template.content.cloneNode(true);
            if (typeof fn === "function") fn(subFrag, list[i]);
            rootFragment.append(subFrag);
        }
        let $ele = document.importNode(rootFragment, true);
        this.append($ele);
        return this;
    };

    /* region sample */
    // let listData = [{name:"ich"},{name:"du"},{name:"er"}];
    //
    // $("ul").appendTemplate($("template"), listData, function(fragment, value) {
    //     //place data in template
    // });
    /*endregion*/

    $.fn.prependTemplate = function(template, list, fn) {
        template = $(template)[0];
        if (!template) throw new Error("template not '%s' found!", template);
        let rootFragment = document.createDocumentFragment();
        for (let i = 0; i < list.length; i++) {
            if(list[i].skip && list[i].skip === true) continue;
            let subFrag = template.content.cloneNode(true);
            if (typeof fn === "function") fn(subFrag, list[i]);
            rootFragment.prepend(subFrag);
        }
        let $ele = document.importNode(rootFragment, true);
        this.prepend($ele);
        return this;
    };

    /* region sample */
    // let listData = [{name:"ich"},{name:"du"},{name:"er"}];
    //
    // $("ul").prependTemplate($("template"), listData, function(fragment, value) {
    //     //place data in template
    // });
    /*endregion*/


}(jQuery));

