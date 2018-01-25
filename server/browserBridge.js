const config = require("jsfair/config");
const WebSocket = require('ws');
let wss;
config.client.preScript.push("/jsfair/browserBridge.js");
function create() {
//add devBridge.js to preScripts config

//setup dev websocket server
    wss = new WebSocket.Server({port: 4222});
    wss.on('connection', function connection(ws) {
        ws.on('open', function incoming(message) {
            // console.log('received: %s', message);
        });
        ws.on('message', function incoming(message) {
            // console.log('received: %s', message);
        });
        ws.on('close', function incoming(message) {
            // console.log('cient closed: %s', message);
        });
        // ws.send({
        //     com: "handshake",
        // });
    });
    wss.broadcast = function broadcast(data) {
        data = JSON.stringify(data);
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    };
}
module.exports = {
    init: create,
    reload() {
        wss.broadcast({
            com: "reload",
        });
    }
};
