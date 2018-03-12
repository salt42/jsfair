const fs = require("fs");
const { fork } = require('child_process');
const browser = require("./server/browserBridge");

let scriptPath = fs.realpathSync(__dirname + '/main.js');
let rootPath;
let devInstance;
/*region color vars*/
let Reset = "\x1b[0m"
let Bright = "\x1b[1m"
let Dim = "\x1b[2m"
let Underscore = "\x1b[4m"
let Blink = "\x1b[5m"
let Reverse = "\x1b[7m"
let Hidden = "\x1b[8m"

let FgBlack = "\x1b[30m"
let FgRed = "\x1b[31m"
let FgGreen = "\x1b[32m"
let FgYellow = "\x1b[33m"
let FgBlue = "\x1b[34m"
let FgMagenta = "\x1b[35m"
let FgCyan = "\x1b[36m"
let FgWhite = "\x1b[37m"

let BgBlack = "\x1b[40m"
let BgRed = "\x1b[41m"
let BgGreen = "\x1b[42m"
let BgYellow = "\x1b[43m"
let BgBlue = "\x1b[44m"
let BgMagenta = "\x1b[45m"
let BgCyan = "\x1b[46m"
let BgWhite = "\x1b[47m"
/*endregion*/
//check arguments
function helpPage(err) {
    console.log("Error: %s".red, err);
    console.log("Usage: node main.js --root ../pathToProjectFolder [argument]");
}
if (process.argv.indexOf('--root') > -1) {
    // rootPath = process.argv[process.argv.indexOf('--root') + 1];
    rootPath = fs.realpathSync(__dirname + process.argv[process.argv.indexOf('--root') + 1]);
    if (!rootPath) {
        helpPage("can't start without root path!");
        return;
    }
} else {
    // helpPage("can't start without root path!");
    // return;
}
//handle child process
let stdin = process.stdin;// process.stdin.setEncoding('utf8');
stdin.setRawMode( true );// without this, we would only get streams once enter is pressed
stdin.setEncoding( 'utf8' );
stdin.resume();// resume stdin in the parent process (node app won't quit all by itself unless an error or process.exit() happens)

let liveReload = true;
let inspector = false;
let headerStyle = Underscore +  FgCyan + BgBlack;
let startArguments = ["--dev", '--inspectWait'];
let outBuffer = [];

function draw() {
    // let size = process.stdout.getWindowSize();
    let liveColor = (!liveReload)? BgRed: BgGreen;
    let inspectColor = (!inspector)? BgRed: BgGreen;

    // process.stdout.write('\033c');
    // if (outBuffer.length > size[1] - 1) {
    //     let lines = outBuffer.splice(0, outBuffer.length - size[1] + 1);
    //     for (let line of lines) {
    //         process.stdout.write(line);
    //     }
    //     for (let i = 0; i < process.stdout.getWindowSize()[1] - lines.length; i++) {
    //         process.stdout.write("\n");
    //     }
    // }
    process.stdout.write('\033c');
    // console.log(size);
    let head = headerStyle + "# JsFair Dev Server\ " +
        "                         [q = quit] [w = Restart Server] [e = Reload Page] [r = liveReload" + liveColor +" " + headerStyle + "] [t = inspect" + inspectColor +" " + headerStyle + "]  " + Reset + "\n"
    process.stdout.write(head);

    // for (let line of outBuffer) {
    //     process.stderr.write(line);
    // }

}
function restartServer() {
    process.stdout.write(FgCyan + "-> RESTARTING SERVER..." + Reset + "\n");
    if (devInstance) killDevServer();
    instantiateDevServer();
}
stdin.on( 'data', function( key ){
    // ctrl-c ( end of text )
    if ( key === '\u0003' ) {
        process.stdout.write(FgCyan + "-> STOPPING SERVER..." + Reset + "\n");
        process.exit();
    }
    if (true) {
        let color, text;
        switch(key) {
            case "q":
                process.stdout.write(FgCyan + "-> STOPPING SERVER..." + Reset + "\n");
                process.exit();
                return;
            case "w":
                draw();
                restartServer();
                return;
            case "e":
                process.stdout.write(FgCyan + "-> RELOAD PAGE" + Reset + "\n");
                devInstance.send({com: "refreshClients"});
                browser.reload();
                return;
            case "r":
                //toggle live reload
                liveReload = !liveReload;
                draw();
                color = FgGreen;
                text = "ACTIVATED";
                if (!liveReload) {
                    text = "DEACTIVATED";
                    color = FgRed;
                }
                process.stdout.write(FgCyan + "-> LIVE RELOAD " + color + text + Reset + "\n");
                return;
            case "t":
                inspector = startArguments.indexOf("--inspect") > -1;
                if (!inspector) {
                    startArguments.push("--inspect");
                    inspector = true;
                } else {
                    startArguments.splice(startArguments.indexOf("--inspect"));
                    inspector = false;
                }
                color = FgGreen;
                text = "ACTIVATED";
                if (inspector) {
                    text = "DEACTIVATED";
                    color = FgRed;
                }
                draw();
                process.stdout.write(FgCyan + "-> INSPECTOR " + color + text + FgRed + Reset + "\n");
                restartServer();
                return;
        }
    }
    // write the key to stdout all normal like
    // process.stdout.write( key );
});

function instantiateDevServer() {
    let args = ["--root", rootPath].concat(startArguments);
    // devInstance = fork(scriptPath, args, { stdio: 'inherit' });
    devInstance = fork(scriptPath, args, { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] });
    // devInstance = fork(scriptPath, ["--dev", "--root", rootPath], { stdio: ['pipe', 'pipe', 'pipe', 'ipc']  });
    // console.log(devInstance);
    devInstance.stdout.on("data", function(e) {
        if (e.toString() === "NEED_CLIENT_RELOAD\n") {
            if (liveReload) {
                process.stdout.write(FgCyan + "-> RELOAD PAGE" + Reset + "\n");
                browser.reload();
            }
        } else {
            process.stdout.write(e);
            // outBuffer.push(e);
            // draw();
        }
    });
    devInstance.stderr.on("data", function(e) {
        process.stderr.write(e);
    });
    devInstance.on('close', function(code, signal) {
        // console.log('test.exe closed',code, signal);
    });
}
function killDevServer() {
    devInstance.kill('SIGTERM');
}

module.exports = function (_rootPath) {
    browser.init().then(() => {
        rootPath = fs.realpathSync(_rootPath);
        draw();
        if (devInstance) killDevServer();
        instantiateDevServer();
    }, (err) => {
        console.error(err);
        process.exit();
    });
};

process.on('uncaughtException', function (err) {
    console.log("ERROR IN DEV SHELL");
    throw err;
});