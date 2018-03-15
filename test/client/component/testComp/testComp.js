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
            name: "du",
            color: "#77c4bb"
        },{
            name: "er",
            color: "#77c4bb"
        },{
            name: "sie",
            color: "#77c4bb"
        },{
            name: "es",
            color: "#77c4bb"
        }]
    });
    this.onUserSelect = function(event, node, user) {
        user.color = "#" + Math.floor(Math.random() * 255 * 255 * 255).toString(16);
        this.data.Users = this.data.Users;
    };
    this.onUserClick = function(node) {
        console.log("click")
    };
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
    //     this.data.Users[0].color = "#" + Math.floor(Math.random() * 255 * 255 * 255).toString(16);
    //     this.data.Users[1].color = "#" + Math.floor(Math.random() * 255 * 255 * 255).toString(16);
    //     this.data.Users = this.data.Users;
    // }, 1000);


    this.onLoad = () => {};

});