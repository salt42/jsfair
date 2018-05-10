defineComp({
    name: "d-comp",
}, function (global) {
    /** @this Component */
    this.model({
        comp: null,
        compOK: false
    });
    this.onLoad = () => {
        setTimeout(() => {
            this.data.compOK = true;
        }, 1);
    };
});