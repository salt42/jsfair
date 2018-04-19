defineComp({
    name: "red",
    template: `<div #css="color:color">Red Component</div>`
}, function (global, template) {
    this.model({
        color: '@color',
        color2: '#0000ff',
    });
});