defineComp({
    name: "bind",
}, function (global) {
    /** @this Component */
    this.model({
        text: "change me!",
        inputData: "ich bin zwei"
    });
    this.onLoad = () => {};
});