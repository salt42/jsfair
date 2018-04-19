defineComp({
    name: "d-text",
}, function (global) {
    /** @this Component */
    this.model({
        welcomeText: 'Hello World',
        user: {
            name: 'Pumuckl'
        }
    });
    this.onLoad = () => {};
    this.getText = (pre, name) => {
        return pre + ' ' + name;
    };
});