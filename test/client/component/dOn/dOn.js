defineComp({
    name: "d-on",
}, function (global) {
    /** @this Component */
    this.model({
        clickCount: 0
    });
    this.clickHandler = (event, node, clickCount) => {
        this.data.clickCount++;
        console.log('clicked',clickCount, event, node);
    };
});