var rpiDhtSensor = require('rpi-dht-sensor');

var dht = new rpiDhtSensor.DHT22(2);

function read() {
  var readout = dht.read();
  getSocket().send(JSON.stringify({value: readout.humidity.toFixed(2), type: 'humidity'}));
  // console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' +
  //     'humidity: ' + readout.humidity.toFixed(2) + '%');
  setTimeout(read, 30000);
}
read();
