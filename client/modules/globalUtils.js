(function($) {
    "use strict";


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

    $.fn.removeOuterClick = function(hideSelector) {
        document.onclick = null;
        return this;
    };
}(jQuery));