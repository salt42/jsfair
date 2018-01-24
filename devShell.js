const fs = require("fs");
const { fork } = require('child_process');

let scriptPath = fs.realpathSync(__dirname + '/main.js');
let rootPath;
let devInstance;


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

stdin.on( 'data', function( key ){
    // ctrl-c ( end of text )
    if ( key === '\u0003' ) {
        process.stdout.write("STOPPING SERVER...\n");
        process.exit();
    }
    if (true) {
        switch(key) {
            case "r":
                process.stdout.write("RESTARTING SERVER...\n");
                if (devInstance) killDevServer();
                instantiateDevServer();
                return;
            case "w":
                process.stdout.write("REFRESHING CLIENTS...\n");
                devInstance.send({com: "refreshClients"});
                return;
        }
    }
    // write the key to stdout all normal like
    process.stdout.write( key );
});

function instantiateDevServer() {
    devInstance = fork(scriptPath, ["--dev", "--root", rootPath], { stdio: 'inherit' });
}
function killDevServer() {
    devInstance.kill('SIGINT');
}

module.exports = function (_rootPath) {
    rootPath = fs.realpathSync(_rootPath);
    if (devInstance) killDevServer();
    instantiateDevServer();
};

