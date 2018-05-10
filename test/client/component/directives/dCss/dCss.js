defineComp({
    name: "d-css",
}, function (global) {
    /** @this Component */
    this.model({
        borderColor: "#"+((1<<24)*Math.random()|0).toString(16),
        size: 17,
    });
    this.onLoad = () => {};
    this.getRandColor = () => {
        return "#"+((1<<24)*Math.random()|0).toString(16);
    }
});