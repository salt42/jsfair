defineComp({
    name: "d-colon",
}, function (global) {
    /** @this Component */
    this.model({
        inputType: 'text',
        greenClass: 'green',
        isGreen: true,
        pinkClass: 'pink',
        yellowClass: 'yellow'
    });

    this.onLoad = () => {};
    this.getGreenClass = () => 'green';

});