import { ChildManager } from "./models/ChildManager";
import { ChildProcess } from "./models/ChildProcess";

//var child = spawn('node ./commands/server.js');
setInterval(() => { }, 1 << 30);
//var child = spawn(`yarn --cwd ${pathed} dev`);
// const child = spawn('yarn.cmd', ['dev'], {
//     cwd: pathed
// });
// // You can also use a variable to save the output 
// // for when the script closes later
// var scriptOutput = "";

// child.stdout.setEncoding('utf8');
// child.stdout.on('data', function (data) {
//     //Here is where the output goes

//     console.log('stdout: ' + data);

//     data = data.toString();
//     scriptOutput += data;
// });

// child.stderr.setEncoding('utf8');
// child.stderr.on('data', function (data) {
//     //Here is where the error output goes

//     console.log('stderr: ' + data);

//     data = data.toString();
//     scriptOutput += data;
// });

// child.on('error', function (error) {
//     //Here you can get the exit code of the script

//     console.error(error);

// });
// child.on('close', function (code) {
//     //Here you can get the exit code of the script

//     console.log('closing code: ' + code);

//     console.log('Full output of script: ', scriptOutput);
// });

const lib = new ChildManager({
    processes: [{
        name: "Pigment",
        command: {
            executor: "yarn",
            args: ["dev"],
            path: "/Users/pixiumdigital/Workspace/nftgameco/pigment-bingo",
            isWindows: false
        },
        maxLogs: 200
    }]
})

function exitHandler(options, exitCode) {
    lib.kill()
    // if (options.cleanup) console.log('clean');
    // if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) {
        console.log(`EXITTED - Child Manager`)
        process.exit();
    }
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

setInterval(() => {
    if (lib) {
        console.log(lib.log())
        console.log(`----------------------------------`)
    }
}, 3000)