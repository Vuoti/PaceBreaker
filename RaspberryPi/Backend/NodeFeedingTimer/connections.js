var mqtt = require('mqtt')
var mqttClient = mqtt.connect('mqtt://test.mosquitto.org:1883')//mqtt.connect('mqtt://192.168.137.90')

mqttClient.on('connect', function () {
  console.log("MQTT Connected.")
  //connections.mqttClient.subscribe('outTopic')
  mqttClient.subscribe('lockstation0/animalInFront')
  mqttClient.subscribe('lockstation1/animalInFront')
  mqttClient.subscribe('lockstation2/animalInFront')
  mqttClient.subscribe('lockstation3/animalInFront')
  mqttClient.subscribe('lockstation4/animalInFront')
  mqttClient.subscribe('system/howManySessions')
  mqttClient.subscribe('system/startTime')
  mqttClient.subscribe('system/stationCount')
  mqttClient.subscribe('system/endTime')
  mqttClient.subscribe('system/addToBreakTimes')
  mqttClient.subscribe('system/minCatches')
  mqttClient.subscribe('system/order')
  mqttClient.subscribe('system/timeBetweenCatches')
  mqttClient.subscribe('system/soundURL')
  mqttClient.subscribe('system/start')
  mqttClient.subscribe('system/stop')
  mqttClient.subscribe('system/currentTime')
  //connections.mqttClient.publish('PlaySound', '0')
})

module.exports = {
  mqttClient: mqttClient
}
