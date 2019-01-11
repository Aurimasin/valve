const onoff = require('onoff');

const { init: initValve, controlValve } = require('./valve');

const { Gpio } = onoff;
const transporter = 16;

const transporterInput = new Gpio(transporter, 'in', 'both', { debounceTimeout: 1 });

let on = false;
let startTime = null;

const init = () => {
  initValve();

  transporterInput.watch((err, value) => {
    if (err) {
      throw err;
    }

    startTime = startTime || new Date();
    if (value && !on) {
      on = true;
      controlValve( startTime);
      startTime = new Date();
    }
    if (!value && on) {
      on = false;
    }
  });
};

process.on('SIGINT', () => {
  console.log('exit.');
  transporterInput.unexport();
});

module.exports = init;
