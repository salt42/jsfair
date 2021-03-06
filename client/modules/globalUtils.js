(function($) {
    "use strict";
    /**
     * The jQuery plugin namespace.
     * @external "jQuery.fn"
     * @see {@link http://docs.jquery.com/Plugins/Authoring The jQuery Plugin Guide}
     */

    /**
     * @function external:"jQuery.fn".hidesOnOuterClick
     * @returns {jQuery}
     * @param excludeSelector
     */
    $.fn.hidesOnOuterClick = function(excludeSelector) {
        let self = this;
        let select = (!!excludeSelector) ? "1" : "0";
        if (excludeSelector) {
            if (excludeSelector.has(self).length !== 0) select += "1";
            else if (self.has(excludeSelector).length !== 0) select += "2";
            else select += "0";
        }

        document.onclick = function(e){
            switch(select){
                case "0":
                    // if the target of the click isn't the container nor a descendant of the container
                    if (!self.is(e.target) && self.has(e.target).length === 0){
                        self.addClass("hidden");
                        self.removeOuterClick();
                    }
                    break;
                case "10":
                    // if the target of the click isn't a descendant of the container nor the excluded selector
                    if (self.has(e.target).length === 0 && !excludeSelector.is(e.target)){
                        self.addClass("hidden");
                        self.removeOuterClick();
                    }
                    break;
                case "11":
                    // self is in hideSelector and if the target of the click isn't the container nor a descendant of the container
                    if (!excludeSelector.is(e.target) && excludeSelector.has(e.target).length === 0){
                        self.addClass("hidden");
                        self.removeOuterClick();
                    }
                    break;
                case "12":
                    // hideSelector is in self and if the target of the click isn't the container nor a descendant of the container
                    if (!excludeSelector.is(e.target) && self.has(e.target).length === 0){
                        self.addClass("hidden");
                        self.removeOuterClick();
                    }
                    break;
            }
        };

        return self;
    };

    /**
     * @function external:"jQuery.fn".removeOuterClick
     * @param hideSelector
     * @returns {jQuery}
     */
    $.fn.removeOuterClick = function(hideSelector) {
        document.onclick = null;
        return this;
    };

    /**
     * @function external:"jQuery.fn".addDataSet
     * @returns {jQuery}
     * @param dataSet
     */
    $.fn.addDataSet = function(dataSet){
        let $to = this;
        for (let dataAttr in dataSet) {
            $to.attr('data-' + dataAttr, dataSet[dataAttr]);
        }
        return this;
    }
}(jQuery));

String.prototype.toCamelCase = function () {
    // removes dashes
    return this
        .replace(/\W+(.)/g, function (x, chr) {
            return chr.toUpperCase();
    })
        .replace(/_+(.)/g, function (x, chr) {
            return chr.toUpperCase();
    });
};
String.prototype.camelCaseToUnder_line = function () {
    return this.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toLowerCase();
};
String.prototype.camelCaseToDash = function () {
    return this.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
};