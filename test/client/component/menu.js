defineComp({
    name: "menu",
    template: `
        <li #goto="/benchmark">Benchmark / mem leak test</li>
        <li #goto="/">Reference</li>
        <li #goto="/binding">comp binding test</li>`
}, function (global, template) {
    this.setData({
        hallo: 42
    })
});