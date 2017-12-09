define("router", function(global){
    "use strict";
    let routes = [
        {
            url: "/",
        },
        {
            url: "/map",
            sections: {
                main: "mapPage"
            }
        }
    ];
    // history.pushState(myNewState.data, myNewState.title, myNewState.url);

    window.onpopstate = function(event){
        // console.log(event.state); // will be our state data, so myNewState.data
    };


    function searchUrl(url) {
        //search url in routes
        for(let i = 0; i < routes.length; i++) {
            routes[i] = {templateId: templateId, controller: controller};
        }
    }
    function route (path, templateId, controller) {
        routes[path] = {templateId: templateId, controller: controller};
    }
    function router () {
        // Current route url (getting rid of '#' in hash as well):
        let url = location.hash.slice(1) || '/';
        // console.log(location.hash);
        // Get route by url:
        // let route = routes[url];
        // if (el && route.controller) {
            // loadComponent(compName, sectionName, args);
            // el.innerHTML = tmpl(route.templateId, new route.controller());
        // }
    }

});