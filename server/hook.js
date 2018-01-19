/**
 * Created by salt on 10.12.2017.
 */
"use strict";
var hookListener = new Map();
var hookNames = {};
let hook = {
    in: function(type, args, func) {
        if (typeof args === "function") {
            func = args;
            args = [];
        }
        let list = [];
        if (hookListener.has(type)) {
            list = hookListener.get(type);
        }
        list.push({
            trigger: func,
            args: args
        });
        hookListener.set(type, list);
    },
    trigger: function(type, ...args) {
        hookNames[type] = true;
        if (hookListener.has(type)) {
            let hooks = hookListener.get(type);
            for(let i = 0; i < hooks.length; i++) {
                hooks[i].trigger(...args);
            }
        }
    },
    getTrigger: function(type, fn) {
        hookNames[type] = true;
        if (hookListener.has(type)) {
            let hooks = hookListener.get(type);
            for(let i = 0; i < hooks.length; i++) {
                fn(hooks[i].trigger, hooks[i].args);
            }
        }
    }
};
module.exports = hook;