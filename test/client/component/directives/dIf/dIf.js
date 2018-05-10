defineComp({
    name: "d-if",
}, function (global) {
    /** @this Component */
    this.model({
        bool: false,
        value: 10,
        values: {
            count: 10
        },
    });
    this.invert = () => this.data.bool = !this.data.bool;
    this.count = (e) => {
        // this.updateValue('values.count', e.target.value)
    };
    this.even = (n) => {
        console.log(n%2);
        return n % 2;
    }
});