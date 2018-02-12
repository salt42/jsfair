(function($) {
    "use strict";


    $.fn.hidesOnOuterClick = function(hideSelector) {
        let self = this;
        document.onclick = function(e){
            hideSelector = (!!hideSelector) ? $(hideSelector[0]) : self;
            console.log(!hideSelector.is(e.target));
            console.log(hideSelector.has(e.target).length === 0);
            console.log('###');

            // if the target of the click isn't the container nor a descendant of the container
            if (!hideSelector.is(e.target) && hideSelector.has(e.target).length === 0){
                self.addClass("hidden");
                self.removeOuterClick();
            }
        };

        return self;
    };

    $.fn.removeOuterClick = function(hideSelector) {
        document.onclick = null;
        return this;
    };
}(jQuery));