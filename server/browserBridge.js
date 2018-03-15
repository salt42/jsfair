const WebSocket = require('ws');
const log = require('./jsfair/log')("browserBridge");
let wss;
let port = 65442;
let debug = false;

let isPortTaken = function(port, fn) {
    let net = require('net');
    let tester = net.createServer()
        .once('error', function (err) {
            if (err.code !== 'EADDRINUSE') return fn(false, err);
            fn(false, err)
        })
        .once('listening', function() {
            tester.once('close', function() { fn(true) })
                .close()
        })
        .listen(port)
};
function create() {
    log('start wss');
    //setup dev websocket server
    wss = new WebSocket.Server({port: port});
    wss.on('connection', function connection(ws) {
        ws.on('open', function incoming(message) {
            if (debug) log('received: %s', message);
        });
        ws.on('message', function incoming(message) {
            if (debug) log('received: %s', message);
        });
        ws.on('close', function incoming(message) {
            // log('cient closed: %s', message);
        });
        ws.send(JSON.stringify({
            com: "handshake",
        }));
        ws.on('error', function(e){
            if (debug) log.error(e);
        });
    });
    wss.broadcast = function broadcast(data) {
        data = JSON.stringify(data);
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(data);
                } catch (e) {
                    log.error(e);
                }
            }
        });
    };
}

module.exports = {
    init: function() {
        return new Promise(function (resolve, reject) {
            isPortTaken(port, function (no) {
                if (no) {
                    create();
                    resolve();
                } else {
                    log.error("Port %s is not free", port);
                    reject();
                    // port++;
                    // module.exports.init();
                }
            });
        });
    },
    reload() {
        wss.broadcast({
            com: "reload",
        });
    }
};
