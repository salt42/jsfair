define("AppState", function(global){
    "use strict";
    let appStates = [
        {
            name: "home",
            url: "/",
            sections: [
                ["main", "sidebar"]
            ]
        },
        {
            name: "files",
            url: "/files",
            sections: [
                ["main", "dat-gui"]
            ]
        },
        {
            name: "editor",
            url: "/editor",
            sections: [
                ["main", "strategy-editor"]
            ]
        }
    ];
// console.log(location.href.slice(location.href.indexOf(location.host) + location.host.length) );
//     this.onAppStateChanged = new rx.fds();


    this.onLoad = function() {
    };
    this.setRoute = function(state) {
        appStates = state;
    };
    this.push = function(state) {
        history.pushState(state, state.name, state.url);
    };
    this.goToState = function (stateName) {
        let state;
        for (let i = 0; i < appStates.length; i++) {
            if (appStates[i].name === stateName) {
                state = appStates[i];
                break;
            }
        }
        //load comps
        for (let i = 0; i < state.sections.length; i++) {
            let section = $("#" + state.sections[i][0]).getComponent();
            if (!section) continue; //@todo error
            section.load(state.sections[i][1]);
        }
        //url auflösen
        //push state
    };
    this.goToUrl = function (url) {
        let targetState = null;
        for (let i = 0; i < appStates.length; i++) {
            if (appStates[i].url === url) {

            }
        }
        if (!targetState) {
            console.error("can't resolve url '%s'", url);
        }
        goToState()
    };


    function loadState(state) {

    }

    // history.pushState(myNewState.data, myNewState.title, myNewState.url);

    window.onpopstate = function(event) {
        alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
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