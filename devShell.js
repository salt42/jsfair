const fs = require("fs");
const { fork } = require('child_process');

let scriptPath = fs.realpathSync(__dirname + '/main.js');
let rootPath;
let devInstance;
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
var stdin = process.stdin;// process.stdin.setEncoding('utf8');
stdin.setRawMode( true );// without this, we would only get streams once enter is pressed
stdin.setEncoding( 'utf8' );
stdin.resume();// resume stdin in the parent process (node app won't quit all by itself unless an error or process.exit() happens)

let liveReload = false;
let headerStyle = Underscore +  FgCyan + BgBlack;
function draw() {
    let liveColor = (!liveReload)? BgRed: BgGreen;
    process.stdout.write('\033c');
    process.stdout.write(headerStyle + "# JsFair Dev Server\ " +
        "                         [q = quit] [w = Restart Server] [e = Reload Page] [r = liveReload" + liveColor +" " + headerStyle + "]  " + Reset + "\n");
}
stdin.on( 'data', function( key ){
    // ctrl-c ( end of text )
    if ( key === '\u0003' ) {
        process.stdout.write(Underscore + FgRed + "-> STOPPING SERVER..." + Reset + "\n");
        process.exit();
    }
    if (true) {
        switch(key) {
            case "q":
                process.stdout.write(FgCyan + "-> REFRESHING CLIENTS" + Reset + "\n");
                devInstance.send({com: "refreshClients"});
                process.stdout.write(Underscore + FgRed + "-> STOPPING SERVER..." + Reset + "\n");
                process.exit();
                return;
            case "w":
                draw();
                process.stdout.write(FgCyan + "-> RESTARTING SERVER..." + Reset + "\n");
                if (devInstance) killDevServer();
                instantiateDevServer();
                return;
            case "e":
                process.stdout.write(FgCyan + "-> RELOAD PAGE" + Reset + "\n");
                devInstance.send({com: "refreshClients"});
                return;
            case "r":
                //toggle live reload
                liveReload = !liveReload;
                draw();
                let color = FgGreen;
                let text = "ACTIVATED";
                if (!liveReload) {
                    text = "DEACTIVATED";
                    color = FgRed;
                }
                process.stdout.write(FgCyan + "-> LIVE RELOAD " + color +((liveReload)?"ACTIVATED":"DEACTIVATED") + FgRed + "        (NOT IMPLEMENTED YET)" + Reset + "\n");
                return;
        }
    }
    // write the key to stdout all normal like
    // process.stdout.write( key );
});

function instantiateDevServer() {
    devInstance = fork(scriptPath, ["--dev", "--root", rootPath], { stdio: 'inherit' });
    // devInstance = fork(scriptPath, ["--dev", "--root", rootPath], { stdio: ['pipe', 'pipe', 'pipe', 'ipc']  });
    // console.log(devInstance);
    // devInstance.stdout.on("data", function(e) {
    //     process.stderr.write(e);
    // });
    // devInstance.stderr.on("data", function(e) {
    //     process.stderr.write(e);
    // });
    // devInstance.on('close', function(code, signal) {
    //     // console.log('test.exe closed',code, signal);
    // });
}
function killDevServer() {
    devInstance.kill('SIGINT');
}

module.exports = function (_rootPath) {
    rootPath = fs.realpathSync(_rootPath);
    draw();
    if (devInstance) killDevServer();
    instantiateDevServer();
};

