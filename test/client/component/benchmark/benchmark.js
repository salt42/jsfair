// defineComp("test", function (global, $element) {  or
let MODel = {
    headLine: '@headline',
    rows: [],
    testClass: "red",
    comp: "red",
    flag: false,
    selected: null,
    loopCount: 0
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
        // console.time('#for')
        this.data.rows = data;
        // console.timeEnd('#for')
    };
    this.randomSelect = () => {
        this.data.selected = this.data.rows[Math.floor(Math.random() * this.data.rows.length)];
    };
    this.removeRow = function () {
        console.log("remove");
    };
    this.selectRow = function (row) {
        // console.log("->", row);
        this.data.selected = row;
        this.scope.onDataUpdate.next('selected');
    };
    this.testResolve = () => {
        //@todo benchmark resolve
    };
    this.memLeakTest = () => {
        memTestTick();
    };
    let self = this;
    function memTestTick() {
        let data = [];
        for (let i = 0; i < 1000; i++) {
            data.push({
                text: "asdfghjkl"
            });
        }
        self.data.rows = data;

        if (self.data.loopCount < 100) {
            self.data.loopCount++;
            setTimeout(memTestTick, 500);
        } else {
            self.data.loopCount = 0;
            self.data.rows = [];
        }
    }
});