defineComp({
    name: "reference",
}, function (global) {
    /** @this Component */

    let directives = [];
    for (let d in jsFair.Directives) {
        if (!jsFair.Directives.hasOwnProperty(d)) continue;
        let name = jsFair.Directives[d].name;
        let comp = 'd-' + name.slice(1);
        if (name === "::") comp = 'd-colon';
        directives.push({
            name: name,
            comp: comp
        });
    }
    this.setData({
        test: 42,
        subcolor: '#00ff00',
        directives: directives//[{name:"alter"}]
            // directives
    });

    this.onLoad = () => {};

});