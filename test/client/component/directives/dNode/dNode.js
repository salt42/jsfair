defineComp({
    name: "d-node",
}, function (global) {
    /** @this Component */
    this.model({
        htmlNode: null,
    });
    this.onLoad = () => {
        this.data.htmlNode.querySelector('.html-node-ok').style.color = 'green';
    };
});