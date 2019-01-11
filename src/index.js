const init = require('./transporter');
const { init: initServer } = require('./socket');

initServer();
init();
