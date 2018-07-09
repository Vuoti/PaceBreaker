// Frontend Code

const mqttTopics = {
  howManySessions: 'system/howManySessions',
  startTime: 'system/startTime',
  endTime: 'system/endTime',
  addToBreakTimes: 'system/addToBreakTimes',
  minCatches: 'system/minCatches',
  order: 'system/order',
  timeBetweenCatches: 'system/timeBetweenCatches',
  soundURL: 'system/soundURL',
  systemStart: 'system/start',
  systemStop: 'system/stop',
  consoleLog: 'system/consoleLog',
  currentTime: 'system/currentTime',
  stationCount: 'system/stationCount'
}
const mqttServer = "test.mosquitto.org"
const mqttPort = 8080


// Create a client instance
client = new Paho.MQTT.Client(mqttServer, Number(8080), "clientId");

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({onSuccess:onConnect});

function MQTTSend(topic, message) {
  console.log(topic + " " + message)
  mqttmessage = new Paho.MQTT.Message(String(message));
  mqttmessage.destinationName = topic;
  client.send(mqttmessage);
  console.log(mqttmessage)
}

// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  client.subscribe(mqttTopics.consoleLog);
  var message = new Paho.MQTT.Message("Hello from desktop!");
  message.destinationName = mqttTopics.consoleLog;
  client.send(message);
/*
  client.subscribe(mqttTopic);
  message = new Paho.MQTT.Message("Hello from desktop!");
  message.destinationName = mqttTopic;
  client.send(message);
  */
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:"+responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:"+message.payloadString);

  if (message.destinationName == mqttTopics.consoleLog) {
    document.getElementById('consoleLog').innerHTML = String(message.payloadString)
  }
}


window.onload = function() {

  console.log("Script loaded.");

  // accessing the DOM
  const startTimeInput = document.getElementById('startTime');
  const endTimeInput = document.getElementById('endTime');
  const breakTimesInput = document.getElementById('breakTime');
  const breakTimesBtn = document.getElementById('breakTimeBtn');
  const howManySessionsInput = document.getElementById('howManySessions');
  const stationCountInput = document.getElementById('stationCount');
  const orderInput = document.getElementById('order');
  const timeBetweenCatchesInput = document.getElementById('timeBetweenCatches');
  const soundURLInput = document.getElementById('soundURL');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const currentTimeInput = document.getElementById('currentTime');
  const setTimeBtn = document.getElementById('setTimeBtn');

  breakTimeBtn.addEventListener("click", function(){
    const breakTime = parseFloat(breakTimesInput.value)
    MQTTSend(mqttTopics.addToBreakTimes, breakTime)
  })

  stopBtn.addEventListener("click", function() {
    MQTTSend(mqttTopics.systemStop, "true")
  })

  startBtn.addEventListener("click", function() {
     console.log('Start clicked!')

    const startTime = parseFloat(startTimeInput.value)
    const endTime = parseFloat(endTimeInput.value)
    const howManySessions = parseInt(howManySessionsInput.value)
    const stationCount = parseInt(stationCountInput.value)
    const order = orderInput.value
    const timeBetweenCatches = parseInt(timeBetweenCatchesInput.value)
    const soundURL = soundURLInput.value

    if (startTime > 0.0 && endTime > 0.0 && howManySessions > 0 && stationCount > 0 && order != "" && timeBetweenCatches > 0 && soundURL != "") {
      MQTTSend(mqttTopics.howManySessions, howManySessions)
      MQTTSend(mqttTopics.startTime, startTime)
      MQTTSend(mqttTopics.endTime, endTime)
      MQTTSend(mqttTopics.stationCount, stationCount)
      MQTTSend(mqttTopics.order, order)
      MQTTSend(mqttTopics.timeBetweenCatches, timeBetweenCatches)
      MQTTSend(mqttTopics.soundURL, soundURL)

      MQTTSend(mqttTopics.systemStart, true)
    } else {
      alert("Please input correct values.")
      console.log("no correct values");
    }

  })

  setTimeBtn.addEventListener("click", function() {
    const currentTime = currentTimeInput.value
    MQTTSend(mqttTopics.currentTime, currentTime)
  })

}
