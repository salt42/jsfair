defineComp("a", function(global, $ele, args) {
    $ele.css("cursor", "pointer");
    $ele.click(function(e) {
        let targetUrl = $ele.attr("href");
        if (targetUrl) {
            return;
        }
        e.preventDefault();
        let targetState = $ele.attr("state");
        if (!targetUrl && targetState) {
            global.AppState.goToState(targetState);
        }
    });
});
define("AppState", function(global) {
    "use strict";
    let appStates = [
        {
            name: "home",
            url: "/",
            sections: [
                // ["SECTION_ID", "COMPONENT_ID"]
            ]
        },
    ];
    this.onAppStateChanged = new Rx.Subject();

    global.onModulesLoaded.subscribe(() => {
        if (!global.hasOwnProperty("sections")) {
            console.error("AppState has dependecies to section component");
            return;
        }
        if (global.hasOwnProperty("Config") && global.Config.hasOwnProperty("States")) {
            //load states from config
            appStates = global.Config.States;
        }
        //push init state
        let startUrl = location.href.slice(location.href.indexOf(location.host) + location.host.length);
        let state;
        for(let i = 0; i < appStates.length; i++) {
            if (appStates[i].url === startUrl) {
                state = appStates[i];
                break;
            }
        }
        if (state) {
            this.push(state);
        }
    });

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
        if (!state) console.error("no state with name '%s'", stateName);
        this.push(state);
        for (let i = 0; i < state.sections.length; i++) {
            let section = $("#" + state.sections[i][0]).getComponent();
            if (!section) continue; //@todo error
            section.load(state.sections[i][1]);
        }
    };
    this.goToUrl = function (url) {
        let targetState = null;
        for (let i = 0; i < appStates.length; i++) {
            if (appStates[i].url === url) {
                goToState()
            }
        }
        if (!targetState) {
            console.error("can't resolve url '%s'", url);
        }
    };

    // history.pushState(myNewState.data, myNewState.title, myNewState.url);

    window.onpopstate = function(event) {
        //load comps
        console.log(event);
        for (let i = 0; i < event.state.sections.length; i++) {
            let section = $("#" + event.state.sections[i][0]).getComponent();
            if (!section) continue; //@todo error
            section.load(event.state.sections[i][1]);
        }
        // alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
    }.bind(this);


    // this.goToUrl(startUrl);
});