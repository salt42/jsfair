defineComp("dev-content", function (global, template) {
    let content = $('<input type="text" #value="user.name"><span>{{user.name}}</span>')
    template.append(content);

    //load default comp
    // global.loadComponent("gMap");
    this.onLoad = () => {};

}, {});