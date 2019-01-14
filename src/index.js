const init = require('./transporter');
const { init: initServer } = require('./socket');
const  read  = require('./temperature')

initServer();
init();

