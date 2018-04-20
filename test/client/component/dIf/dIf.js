defineComp({
    name: "d-if",
}, function (global) {
    /** @this Component */
    this.model({
        bool: false,
    });
    this.invert = () => this.data.bool = !this.data.bool;
});