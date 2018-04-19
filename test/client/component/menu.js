defineComp({
    name: "menu",
    template: `
        <li #goto="/benchmark">Benchmark</li>
        <li #goto="/">Reference</li>`
}, function (global, template) {
    this.setData({
        hallo: 42
    })
});