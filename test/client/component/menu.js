defineComp({
    name: "menu",
    template: `
        <li #goto="/">Directives</li>
        <li #goto="/binding">Component binding</li>
        <li #goto="/benchmark">Benchmark / mem leak test</li>
`
}, function (global, template) {
    this.setData({
        hallo: 42
    })
});