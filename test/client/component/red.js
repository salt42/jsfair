defineComp({
    name: "red",
    template: `<div style="color: white;" #css="color: color">Red Component</div>`
}, function (global, template) {
    this.model({
        color: '@color',
        color2: '#0000ff',
    });
});