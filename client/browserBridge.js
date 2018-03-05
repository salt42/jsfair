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
        try {
            ws = new WebSocket('ws://' + host + ':65442');

            ws.onopen = (e) => {
                ws.send(JSON.stringify({
                    com: "handshake"
                }));
            };
            ws.onclose = (e) => {
                // reload();
            };
            ws.onerror = (e) => {
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
        } catch (e) {

        }
    }
    window.onbeforeunload = function (e) {
        close();
    };
    initSocket();
    setInterval(check, 5000);
})();