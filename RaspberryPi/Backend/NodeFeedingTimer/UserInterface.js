// Interface for Main JS
const commandLine = require('node-run-cmd')
const connections = require("./connections.js")

// 1. Configure everything
let configuration = {
    howManySessions: 2,
    startTime: 19.29,
    endTime: 19.38,
    breakTimes: null,
    minCatches: 5,
    stationCount: 5,
    order: "random",
    timeBetweenCatches: 30000, // milliseconds // sollte aufgrund der langsamen Station_Sensoren mindestens 6000 betragen
    soundURL: "/defaultSound.mp3"
}

connections.mqttClient.on('message', function (topic, message) {
    // message is Buffer
    console.log(topic + " " + message)
    var isTrueSet = (message == 'true' || message == 'True' || message == 'TRUE'); // convert message (buffer) to bool
  
    switch (topic) {
      case 'system/howManySessions': 
        console.log(message + " Sessions.")
        configuration.howManySessions = parseInt(message)
        break
      case 'system/startTime': 
        configuration.startTime = parseFloat(message).toFixed(2)
        break
      case 'system/endTime': 
        configuration.endTime = parseFloat(message).toFixed(2)
        break
      case 'system/stationCount': 
        configuration.stationCount = parseInt(message)
        break
      case 'system/addToBreakTimes':
        // mqtt doesn't support arrays, so we'll just send in the times after each other and append them
        if(configuration.breakTimes == null) {
            configuration.breakTimes = []
        }
        configuration.breakTimes.push(parseFloat(message))
        console.log(parseFloat(message) + " has been added to configuration.breakTimes")
        break
      case 'system/minCatches': 
        configuration.minCatches = parseInt(message)
        break
      case 'system/order':
        configuration.order = message.toString()
        break
      case 'system/timeBetweenCatches':
        configuration.timeBetweenCatches = parseInt(message)
        break
      case 'system/soundURL':
        configuration.soundURL = message.toString()
        break
      case 'currentTime':
        let currentTime = message.toString()
        console.log(currentTime)
        break
      case 'system/start':
        configuration.soundURL = message.toString()
        run()
        break
      default:
        console.log(message.toString())
    }
  
    //connections.mqttClient.end()
  })

// 2A. Start Main.js
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log(configuration)
    console.log("Starting programm")
    sleep(1000)

    const runThis = "node Main.js --howManySessions=" + configuration.howManySessions + " --startTime=" + configuration.startTime + " --endTime=" + configuration.endTime + " --breakTimes=" + configuration.breakTimes + " --minCatches=" + configuration.minCatches + " --order=" + configuration.order + " --timeBetweenCatches=" + configuration.timeBetweenCatches + " --soundURL=" + configuration.soundURL + " --stationCount=" + configuration.stationCount

    commandLine.run(runThis, { onData: dataCallback });
}

var dataCallback = function(data) {
    console.log(data); // show console output - we could even return it to the interface
    connections.mqttClient.publish('system/consoleLog', data.toString())
  };

//commandLine.run(runThis, { onData: dataCallback })

// 2B. Start Heatmap.js

// 3. Hand back session analysis data
