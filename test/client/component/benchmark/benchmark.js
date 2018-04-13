// defineComp("test", function (global, $element) {  or
let MODel = {
    rows: [],
    testClass: "red",
    comp: "red",
    flag: false
};
defineComp({
    name: "benchmark",
}, function (global) {
    /** @this Component */
    this.model(MODel);

    this.onLoad = () => {};
    this.runTest = () => {
        let data = [];
        for (let i = 0; i < 1000; i++) {
            data.push({
                text: (Math.random() * 99999).toString(16)
            });
        }
        this.data.rows = data;
    };
    this.onClickX = function () {
        console.log("remove");
    };
    this.onClickLi = function () {
        console.log("clicked");
    };
    this.bla = function() {
        this.data.flag = !this.data.flag;

    };
    this.handlerFunc = (...args) => console.log(...args);
});