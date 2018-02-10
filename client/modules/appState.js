defineComp("a", function(global, $ele, args) {
    $ele.css("cursor", "pointer");
    $ele.click(function(e) {
        let targetUrl = $ele.attr("href");
        if (targetUrl) {
            return;
        }
        e.preventDefault();
        let target = $ele.attr("state");
        if (target) {
            global.AppState.goToState(target);
            return;
        }
        target = $ele.attr("url");
        if (target) {
            global.AppState.goToUrl(target);
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
    this.onAppStateChanged = new Rx.ReplaySubject();

    global.onPageLoaded.subscribe(function() {
        console.log("modules loaded");
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
        // let state;
        // for(let i = 0; i < appStates.length; i++) {
        //     if (appStates[i].url === startUrl) {
        //         state = appStates[i];
        //         break;
        //     }
        // }
        // if (state) {
        //     this.push(state);
        // }
    }.bind(this));

    this.push = function(state) {
        history.pushState(state, state.name, state.url);
    };
    this.goToState = function (stateName, data = null) {
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
        onAppStateChanged.next();
    };


    window.onpopstate = function(event) {
        //load comps
        console.log(event);
        for (let i = 0; i < event.state.sections.length; i++) {
            let section = $("#" + event.state.sections[i][0]).getComponent();
            if (!section) continue; //@todo error
            section.load(event.state.sections[i][1]);
        }
    }.bind(this);


    this.goToUrl = function (url) {
        console.log(url);
        let targetState = null;

        for (let i = 0; i < appStates.length; i++) {
            if (typeof appStates[i].url === "string") {
                let keys = [];
                let re = pathToRegexp(appStates[i].url, keys);
                re = re.exec(url);
                if (re) {
                    targetState = Object.assign({}, appStates[i] );
                    targetState.args = {};
                    for (let j = 1; j < re.length; j++) {
                        targetState.args[keys[j - 1].name] = re[j];
                    }

                    break;
                }
            } else if (typeof appStates[i].url === "object") {
            } else if (typeof appStates[i].url === "function") {
            }
        }
        if (!targetState) {
            console.error("can't resolve url '%s'", url);
            return;
        }
        //load comps from targetState
        let wait = [];
        for (let i = 0; i < targetState.section.length; i++) {
            let section = $("#" + targetState.section[i][0]).getComponent();
            if (!section) {
                console.error("error loading section '%s'", targetState.section[i][0]);
            } else {
                let promise = section.load(targetState.section[i][1]);
                wait.push(promise);
            }
        }
        Promise.all(wait).then(function() {
            console.log(targetState);//ich glaub aber leider das des wtwas komplizierter wird den auf childs umzubauen  push den mal so ich mach des
        });
        //fire event
        this.onAppStateChanged.next(targetState);
    }.bind(this);











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