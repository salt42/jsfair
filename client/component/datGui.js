defineComp("dat-gui", function (global, $element) {
    "use strict";

    let $button = $("<button>");
    $button.html("test");
    $element.append($button);
    let $button2 = $("<button>");
    $button2.html("load");
    $element.append($button2);
    $element.css("background", "#" + Math.floor(Math.random() * 255 * 255 * 255).toString(16) );

    $button.on("click", (e) => {
        global.sections.load("main", "test");
    });
    $button2.on("click", (e) => {
        global.sections.load("main", "dev-content");
    });

    this.onLoad = () => {};

}, {});

// let routing = [
//     {
//         id:
//     },
// ];
// function State(id) {
//     this.id = ""
// }
