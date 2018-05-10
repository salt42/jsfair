defineComp({
    name: "d-for",
}, function (global) {
    this.model({
        global: ':)',
        Users: [{
            name: 'Sepp',
            color: "#"+((1<<24)*Math.random()|0).toString(16)
        },{
            name: 'Tobi',
            color: "#"+((1<<24)*Math.random()|0).toString(16)
        },{
            name: 'funny',
            color: "#"+((1<<24)*Math.random()|0).toString(16)
        }]
    });
});