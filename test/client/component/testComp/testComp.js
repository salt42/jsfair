// defineComp("test", function (global, $element) {  or
defineComp({
    name: "test-comp",
}, function (global) {
    /** @this Component */
    let onUserChange = new Rx.Subject();
    this.model({
        testVar: "nice!!",
        // User: "bla",
        // attr1: "@attr-name",
        // Users: onUserChange
        Users: [{
            name: "salt",
            color: "#" + Math.floor(Math.random() * 255 * 255 * 255).toString(16)
        },{
            name: "ich",
            color: "#77c4bb"
        },{
            name: "es",
            color: "#77c4bb"
        },{
            name: "efgdss",
            color: "#77c4bb"
        },{
            name: "egfs",
            color: "#77c4bb"
        },{
            name: "eaas",
            color: "#77c4bb"
        },{
            name: "es5435",
            color: "#77c4bb"
        },{
            name: "es6565654",
            color: "#77c4bb"
        }]
    });
    // console.log(this.data)
    // this.data.onUpdate.subscribe((...e) => console.log(...e));
    // setTimeout(function() {
    //     onUserChange.next([{
    //         name: "salt",
    //         color: "#" + Math.floor(Math.random() * 255 * 255 * 255).toString(16)
    //     },{
    //         name: "ich",
    //         color: "#77c4bb"
    //     },{
    //         name: "es",
    //         color: "#77c4bb"
    //     }]);
    // }.bind(this), 1000);

    //
    // let aa = ["a", "ab", "abc", "abcd", "abcde", "abcdef", "abcdefg"]
    // let i = 0;
    // setInterval(() => {
    //     this.data.testVar = aa[i];
    //     if (i < aa.length - 1) {
    //         i++;
    //     } else {
    //         i = 0;
    //     }
    // }, 1000);




    // $element.html('<input type="number" value="999999999">');
    // $element.css("background", "#" + Math.floor(Math.random() * 255 * 255 * 255).toString(16) );
    //load default comp
    // global.loadComponent("gMap");
    this.onLoad = () => {};

});

//!! global require dummy needed
// require();
// defineModule({
//     name: "TestModule"
// }, function() {
//
// });