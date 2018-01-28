const WebSocket = require('ws');
let wss;
let port = 4221;

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
    //setup dev websocket server
    wss = new WebSocket.Server({port: port});
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
                try {
                    client.send(data);
                } catch (e) {
                    console.log(e);
                }
            }
        });
    };
}

module.exports = {
    init: function() {
        isPortTaken(port, function (no) {
            if (no) {
                create();
            } else {
                port++;
                module.exports.init();
            }
        });
    },
    reload() {
        wss.broadcast({
            com: "reload",
        });
    }
};
