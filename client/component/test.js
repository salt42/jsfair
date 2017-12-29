defineComp("test", function (global, $element) {
    $element.html('<input type="number" value="999999999">');
    $element.css("background", "#" + Math.floor(Math.random() * 255 * 255 * 255).toString(16) );
    //load default comp
    // global.loadComponent("gMap");
    this.onLoad = () => {};

}, {});