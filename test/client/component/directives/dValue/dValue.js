defineComp({
    name: "d-value",
}, function (global) {
    /** @this Component */
    this.model({
        textValue: 'input text',
        mTextValue: `input text
        next line`,
        numberValue: 42,
        boolValue: true,
        nested: {
            test: "nested value"
        }
    });
    this.filter = () => {
        this.data.textValue = this.data.textValue.replace(/[tölrew]/g, '');
        // this.data.nested.test = this.data.nested.test.replace(/[tölrew]/g, '');
        this.updateValue('nested.test', this.data.nested.test.replace(/[tölrew]/g, ''))
    };
    this.add = () => {
        this.data.numberValue++;
    };
    this.toggleBool = () => {
        this.data.boolValue = !this.data.boolValue;
    };
});