defineComp({
    name: "my-input",
    template: `
        <input type="text" #value="value">`
}, function (global, template) {
    this.setData({
        value: "@@val"
    })
});