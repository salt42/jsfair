// defineComp("a", function(global) {
//     let $ele = this.$ele;
//     $ele.css("cursor", "pointer");
//     if (!$ele[0].hasAttribute("url")) return;
//     $ele.click(function(e) {
//         if (!$ele[0].hasAttribute("url")) {
//             return;
//         }
//         let targetUrl = $ele.attr("url");
//         e.preventDefault();
//         if (targetUrl) {
//             global.AppState.goToUrl(targetUrl);
//         }
//     });
// });
defineDirective({ name: "#goto" }, function (node, attr, scope) {
    let isUrl = attr.indexOf("/") > -1;
    let appState = window.jsFair.global.AppState;
    node.removeAttribute("#goto");
    node.addEventListener('click', () => {
        if (isUrl) return appState.goToUrl(attr);
        appState.goToState(attr);
    });
});
define("AppState", function(global) {
    "use strict";
    /**
     * @namespace Global
     * @property {object} AppState
     */
    /**
     * @this {AppState}
     */
    /**
     * @memberOf Global.AppState
     */
    document.querySelectorAll('a[url]').forEach((node, index) => {
        node.addEventListener("click", (e) => {
            global.AppState.goToUrl(node.getAttribute('url'));
        });
    });
    /**
     * @memberOf Global.AppState
     */
    this.onAppStateChanged = new Rx.ReplaySubject();
    let debug = false;//@notLive
    let benchmark = false;//@notLive
    let self = this;
    let appStates = [
        {
            name: "aaaa",
            url: "/sub/:ff",
            sections: [
                // ["SECTION_ID", "jsonform"]
            ]
        },
        {
            name: "behandlung",
            url: "/d/",
            sections: [
                ["main-content", "sidebar"]
            ],
            sub: [{
                name: "testRoute",
                url: "test/:aa/",
                sections: [
                    ["section-sidebar-top", "search"]
                ],
                sub: [{
                    name: "subsubRoute",
                    url: "sub/:ff",
                    sections: [
                        // ["SECTION_ID", "jsonform"]
                    ]
                },{
                    name: "dsadsa",
                    url: "test/:aa/",
                    sections: [
                        ["section-sidebar-top", "search"]
                    ],
                    sub: []
                }]
            }]
        },
    ];

    function push (state) {
        history.pushState(state, state.name, state.url);
    }
    function match(url, states, fn, _result = []) {
        for (let i = 0; i < states.length; i++) {
            let state = states[i];
            let keys = [];
            let re = pathToRegexp(state.url, keys, {
                end: false,
                // strict: true
            });
            if (debug) console.log("try match: '%s'  ON  '%s' ", state.url, url);//@notLive
            let r = re.exec(url);

            if(r) {
                if (debug) console.log("matched: ", url, state);//@notLive
                let args = {};
                if (debug) console.log("arguments: ", keys);//@notLive
                for (let k = 0; k < keys.length; k++) {
                    args[keys[k].name] = r[k + 1];
                }
                let sections = (typeof state.sections === 'function')? state.sections(global): state.sections || [];
                let stateEvent = {
                    name: state.name,
                    args: args,
                    sections: sections
                };
                _result.push(stateEvent);
                /*load comps*/
                if(sections.length > 0) {
                    if (debug) console.log("load sections: ", sections);//@notLive
                    let wait = [];
                    for (let i = 0; i < sections.length; i++) {
                        $("section#" + sections[i][0])
                            .each((index, $section) => {
                                let section = $section.getComponent();
                                if (!section) {
                                    console.error("error loading section '%s'", sections[i][0]);
                                } else {
                                    if (!sections[i][1]) section.unLoad();
                                    else wait.push(section.load(sections[i][1], args) );
                                }
                            });
                    }
                    Promise.all(wait).then(function () {
                        // self.onAppStateChanged.next(stateEvent);
                        if(state.sub) {
                            if (debug) console.log("match subs");//@notLive
                            url = url.replace(r[0], "");
                            if (debug) console.log(url, state.sub, _result);//@notLive
                            match(url, state.sub, fn, _result);
                        } else {
                            if (debug) console.log("matching completed");//@notLive
                            if (typeof fn === "function") fn(_result);
                        }
                    }.bind(this));
                    return;
                } else {
                    // self.onAppStateChanged.next(stateEvent);
                    if(state.sub) {
                        if (debug) console.log("match subs");//@notLive
                        url = url.replace(r[0], "");
                        console.log('deeper', state.url);
                        match(url, state.sub, fn, _result);
                    } else {
                        if (debug) console.log("matching completed");//@notLive
                        if (typeof fn === "function") fn(_result);
                    }
                    return;
                }
            } else {
                if (debug) console.log("faild matching: ", url, state);//@notLive
            }
        }
        if (debug) console.log("matching completed");//@notLive
        if (typeof fn === "function") fn(_result);
    }
    /**
     * @memberOf Global.AppState
     */
    this.setDebug = (val) => {
        debug = val;
    };
    /**
     * @description call state via url
     * @memberOf Global.AppState
     * @param {string} url
     */
    this.goToUrl = function (url) {
        if(debug) console.log("GoToUrl", url);//@notLive
        if(benchmark) console.time("AppState Time");//@notLive
        match(url, appStates, (states) => {
            if(debug) console.log(states);//@notLive
            self.onAppStateChanged.next(states[states.length-1]);
            push({
                name: states[states.length-1],
                url: url,
                matches: states
            });
            if(benchmark) console.timeEnd("AppState Time");//@notLive
        });
    };
    /**
     * @todo marked deprecated untill implementation
     * @summary call state directly
     * @memberOf Global.AppState
     * @param {string} url
     */
    this.goToState = function (state) {
        console.error('Not implemented yet');
        // if(debug) console.log("GoToState", state);//@notLive
        // if(benchmark) console.time("AppState Time");//@notLive
        // if(debug) console.log(state);//@notLive
        // push({
        //     name: state[state.length-1],
        //     url: null,
        //     matches: state
        // });
        // if(benchmark) console.timeEnd("AppState Time");//@notLive
    };

    global.onPageLoaded.subscribe(function() {
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
        this.goToUrl(startUrl);
    }.bind(this));
    window.onpopstate = function(event) {
        match(event.state.url, appStates, (state) => { });
    }.bind(this);
    jsFair.Component.prototype.onState = function(filter, fn) {
        if (typeof filter === 'function') fn = filter;
        if (typeof filter === 'string') filter = [filter];
        self.onAppStateChanged
            .filter(v => (filter.indexOf(v.name) > -1))
            .subscribe(fn);
    }





    /**
        https://github.com/pillarjs/path-to-regexp
     **/


    /**
     * Default configs.
     */
    let DEFAULT_DELIMITER = '/';
    let DEFAULT_DELIMITERS = './';

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    let PATH_REGEXP = new RegExp([
        // Match escaped characters that would otherwise appear in future matches.
        // This allows the user to escape special characters that won't transform.
        '(\\\\.)',
        // Match Express-style parameters and un-named parameters with a prefix
        // and optional suffixes. Matches appear as:
        //
        // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
        // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined]
        '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'
    ].join('|'), 'g')

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {string}  str
     * @param  {Object=} options
     * @return {!Array}
     */
    function parse (str, options) {
        let tokens = []
        let key = 0
        let index = 0
        let path = ''
        let defaultDelimiter = (options && options.delimiter) || DEFAULT_DELIMITER
        let delimiters = (options && options.delimiters) || DEFAULT_DELIMITERS
        let pathEscaped = false
        let res

        while ((res = PATH_REGEXP.exec(str)) !== null) {
            let m = res[0]
            let escaped = res[1]
            let offset = res.index
            path += str.slice(index, offset)
            index = offset + m.length

            // Ignore already escaped sequences.
            if (escaped) {
                path += escaped[1]
                pathEscaped = true
                continue
            }

            let prev = ''
            let next = str[index]
            let name = res[2]
            let capture = res[3]
            let group = res[4]
            let modifier = res[5]

            if (!pathEscaped && path.length) {
                let k = path.length - 1

                if (delimiters.indexOf(path[k]) > -1) {
                    prev = path[k]
                    path = path.slice(0, k)
                }
            }

            // Push the current path onto the tokens.
            if (path) {
                tokens.push(path)
                path = ''
                pathEscaped = false
            }

            let partial = prev !== '' && next !== undefined && next !== prev
            let repeat = modifier === '+' || modifier === '*'
            let optional = modifier === '?' || modifier === '*'
            let delimiter = prev || defaultDelimiter
            let pattern = capture || group

            tokens.push({
                name: name || key++,
                prefix: prev,
                delimiter: delimiter,
                optional: optional,
                repeat: repeat,
                partial: partial,
                pattern: pattern ? escapeGroup(pattern) : '[^' + escapeString(delimiter) + ']+?'
            })
        }

        // Push any remaining characters.
        if (path || index < str.length) {
            tokens.push(path + str.substr(index))
        }

        return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {string}             str
     * @param  {Object=}            options
     * @return {!function(Object=, Object=)}
     */
    function compile (str, options) {
        return tokensToFunction(parse(str, options))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens) {
        // Compile all the tokens into regexps.
        let matches = new Array(tokens.length)

        // Compile all the patterns before compilation.
        for (let i = 0; i < tokens.length; i++) {
            if (typeof tokens[i] === 'object') {
                matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$')
            }
        }

        return function (data, options) {
            let path = ''
            let encode = (options && options.encode) || encodeURIComponent

            for (let i = 0; i < tokens.length; i++) {
                let token = tokens[i]

                if (typeof token === 'string') {
                    path += token
                    continue
                }

                let value = data ? data[token.name] : undefined
                let segment

                if (Array.isArray(value)) {
                    if (!token.repeat) {
                        throw new TypeError('Expected "' + token.name + '" to not repeat, but got array')
                    }

                    if (value.length === 0) {
                        if (token.optional) continue

                        throw new TypeError('Expected "' + token.name + '" to not be empty')
                    }

                    for (let j = 0; j < value.length; j++) {
                        segment = encode(value[j])

                        if (!matches[i].test(segment)) {
                            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '"')
                        }

                        path += (j === 0 ? token.prefix : token.delimiter) + segment
                    }

                    continue
                }

                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    segment = encode(String(value))

                    if (!matches[i].test(segment)) {
                        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but got "' + segment + '"')
                    }

                    path += token.prefix + segment
                    continue
                }

                if (token.optional) {
                    // Prepend partial segment prefixes.
                    if (token.partial) path += token.prefix

                    continue
                }

                throw new TypeError('Expected "' + token.name + '" to be ' + (token.repeat ? 'an array' : 'a string'))
            }

            return path
        }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {string} str
     * @return {string}
     */
    function escapeString (str) {
        return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {string} group
     * @return {string}
     */
    function escapeGroup (group) {
        return group.replace(/([=!:$/()])/g, '\\$1')
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {string}
     */
    function flags (options) {
        return options && options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {!RegExp} path
     * @param  {Array=}  keys
     * @return {!RegExp}
     */
    function regexpToRegexp (path, keys) {
        if (!keys) return path

        // Use a negative lookahead to match only capturing groups.
        let groups = path.source.match(/\((?!\?)/g)

        if (groups) {
            for (let i = 0; i < groups.length; i++) {
                keys.push({
                    name: i,
                    prefix: null,
                    delimiter: null,
                    optional: false,
                    repeat: false,
                    partial: false,
                    pattern: null
                })
            }
        }

        return path
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {!Array}  path
     * @param  {Array=}  keys
     * @param  {Object=} options
     * @return {!RegExp}
     */
    function arrayToRegexp (path, keys, options) {
        let parts = []

        for (let i = 0; i < path.length; i++) {
            parts.push(pathToRegexp(path[i], keys, options).source)
        }

        return new RegExp('(?:' + parts.join('|') + ')', flags(options))
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {string}  path
     * @param  {Array=}  keys
     * @param  {Object=} options
     * @return {!RegExp}
     */
    function stringToRegexp (path, keys, options) {
        return tokensToRegExp(parse(path, options), keys, options)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {!Array}  tokens
     * @param  {Array=}  keys
     * @param  {Object=} options
     * @return {!RegExp}
     */
    function tokensToRegExp (tokens, keys, options) {
        options = options || {}

        let strict = options.strict
        let end = options.end !== false
        let delimiter = escapeString(options.delimiter || DEFAULT_DELIMITER)
        let delimiters = options.delimiters || DEFAULT_DELIMITERS
        let endsWith = [].concat(options.endsWith || []).map(escapeString).concat('$').join('|')
        let route = ''
        let isEndDelimited = false

        // Iterate over the tokens and create our regexp string.
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i]

            if (typeof token === 'string') {
                route += escapeString(token)
                isEndDelimited = i === tokens.length - 1 && delimiters.indexOf(token[token.length - 1]) > -1
            } else {
                let prefix = escapeString(token.prefix)
                let capture = token.repeat
                    ? '(?:' + token.pattern + ')(?:' + prefix + '(?:' + token.pattern + '))*'
                    : token.pattern

                if (keys) keys.push(token)

                if (token.optional) {
                    if (token.partial) {
                        route += prefix + '(' + capture + ')?'
                    } else {
                        route += '(?:' + prefix + '(' + capture + '))?'
                    }
                } else {
                    route += prefix + '(' + capture + ')'
                }
            }
        }

        if (end) {
            if (!strict) route += '(?:' + delimiter + ')?'

            route += endsWith === '$' ? '$' : '(?=' + endsWith + ')'
        } else {
            if (!strict) route += '(?:' + delimiter + '(?=' + endsWith + '))?'
            if (!isEndDelimited) route += '(?=' + delimiter + '|' + endsWith + ')'
        }

        return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(string|RegExp|Array)} path
     * @param  {Array=}                keys
     * @param  {Object=}               options
     * @return {!RegExp}
     */
    function pathToRegexp (path, keys, options) {
        if (path instanceof RegExp) {
            return regexpToRegexp(path, keys)
        }

        if (Array.isArray(path)) {
            return arrayToRegexp(/** @type {!Array} */ (path), keys, options)
        }

        return stringToRegexp(/** @type {string} */ (path), keys, options)
    }
    
    
    
    
    
    
});