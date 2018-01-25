(function() {
    let ws;
    let host = window.document.location.host.replace(/:.*/, '');
    function close() {
        if(ws && typeof ws.close === "function") ws.close();
    }
    function check(){
        if(!ws || ws.readyState === 3) initSocket();
    }
    function initSocket() {
        close();
        ws = new WebSocket('ws://' + host + ':4222');

        ws.onopen = (e) => {
            // console.log("socket open", e);
            ws.send(JSON.stringify({
                com: "handshake"
            }));
        };
        ws.onclose = (e) => {
            // console.log("socket close", e);
            // reload();
        };
        ws.onerror = (e) => {
            // console.log("socket error", e);
            // reload();
        };
        ws.onmessage = function (event) {
            let com = JSON.parse(event.data);
            switch (com.com) {
                case "handshake":
                    break;
                case "reload":
                    ws.close();
                    location.reload();
                    break;
            }
        };
    }
    window.onbeforeunload = function (e) {
        close();
    };
    initSocket();
    setInterval(check, 5000);
})();