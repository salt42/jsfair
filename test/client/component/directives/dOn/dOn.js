defineComp({
    name: "d-on",
}, function (global) {
    /** @this Component */
    this.model({
        clickCount: 0,
        hover: false,
    });
    this.clickHandler = (event, node, clickCount) => {
        this.data.clickCount++;
        console.log('clicked',clickCount, event, node);
    };
    this.mouseEnterHandler = (event, node) => {
        this.data.hover = true;
        console.log('mouse enter', event, node);
    };
    this.mouseLeaveHandler = (event, node) => {
        this.data.hover = false;
        console.log('mouse leave', event, node);
    };
});