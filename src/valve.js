const onoff = require('onoff');

const { getSocket } = require('./socket');

const { Gpio } = onoff;
const initValve = 26;
const exitValve = 19;
const valveOpen = 5;
const valveClose = 6;

const initValveInput = new Gpio(initValve, 'in', 'both', { debounceTimeout: 1 });
const exitValveInput = new Gpio(exitValve, 'in', 'both', { debounceTimeout: 1 });
const valveOpenOutput = new Gpio(valveOpen, 'out', 'none', { activeLow: true });
const valveCloseOutput = new Gpio(valveClose, 'out', 'none', { activeLow: true });
valveOpenOutput.writeSync(Gpio.LOW);
valveCloseOutput.writeSync(Gpio.LOW);

const RPS_MIN = 15;
const RPS_MAX = 30;
const interval = 1000;
let initialised = false;
let valveRunning = false;
let runValveEnd = null;
const waitTime = 5000;

const runValve = (open = true, time = 1000) => {
  valveRunning = true;
  console.log(open ? `opening: ${time / 1000}s` : `closing: ${time / 1000}s`);
  const output = open ? valveOpenOutput : valveCloseOutput;
  output.writeSync(Gpio.HIGH);
  setTimeout(() => {
    output.writeSync(Gpio.LOW);
    runValveEnd = new Date();
    valveRunning = false;
    console.log(open ? 'opened.' : 'closed.');
  }, time);
};

const startValve = () => {
  console.log('starting...');
  runValve(true, 5000);
};

const stopValve = () => {
  console.log('stopping...');
  runValve(false, 10000);
};

const controlValve = (startTime) => {
  const now = new Date();
  const RPS = interval / (now.getTime() - startTime.getTime());
  console.log('RPS', RPS, valveRunning || !initialised || (now.getTime() - runValveEnd.getTime() < waitTime));
  getSocket().send(RPS);
  if (valveRunning || !initialised || (now.getTime() - runValveEnd.getTime() < waitTime)) {
    return false;
  }

  if (RPS >= RPS_MAX) {
    runValve();
  } else if (RPS <= RPS_MIN) {
    runValve(false);
  }
};

const init = () => {
  initValveInput.watch((err, value) => {
    if (err) {
      throw err;
    }

    if (!initialised && value) {
      initialised = true;
      startValve();
    }
  });

  exitValveInput.watch((err, value) => {
    if (err) {
      throw err;
    }

    if (initialised && value) {
      initialised = false;
      stopValve();
    }
  });
};

process.on('SIGINT', () => {
  console.log('exit valve.');
  valveOpenOutput.unexport();
  valveCloseOutput.unexport();
});

module.exports = { init, controlValve };
