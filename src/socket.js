const server = require('ws').Server;

const serverInstance = new server({ port: 5001 });
let webSocket = { send: () => {} };

init = () => {
    serverInstance.on('connection', ws => {
        webSocket = ws;
    });
}

getSocket = () => webSocket;

module.exports = { init, getSocket };