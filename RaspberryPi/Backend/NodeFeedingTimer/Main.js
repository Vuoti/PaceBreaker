const args = require("minimist")(process.argv.slice(2))
const tools = require("./tools")
const session = require("./Session.js")
const feeder = require("./Feeder.js")
const lockstation = require("./Lockstation.js")
const connections = require("./connections.js")

// Initiate Station Logic
var lockstations = []
const lockstation0 = new lockstation.Lockstation(0)
const lockstation1 = new lockstation.Lockstation(1)
const lockstation2 = new lockstation.Lockstation(2)
const lockstation3 = new lockstation.Lockstation(3)
const lockstation4 = new lockstation.Lockstation(4)
var lockstationsExistant = []
lockstationsExistant.push(lockstation0, lockstation1, lockstation2, lockstation3, lockstation4)
const feeder1 = new feeder.Feeder()

var startTime

var myDailySessionSettings 
var mySessionSettings


// test

/*
function sessionTest() {
  //myDailySession.generateSessionTimes()
  console.log("You created a session that starts at " + myDailySessionSettings.startTime + " and ends at " + myDailySessionSettings.endTime + ".")
  if (myDailySessionSettings.pauseTimes != null) {
    console.log("It has " + myDailySessionSettings.pauseTimes.length + " pause time/s. 30 mins each. At " + myDailySessionSettings.pauseTimes + ".")
  }
  console.log("\nI generated " + myDailySessionSettings.howManyTimes + " session times:")
  for (var i = 0; i<myDailySession.sessionTimes.length; i++) {
    console.log((i+1) + "\t" + tools.decimalTimeSplit(myDailySession.sessionTimes[i])[0] + ":" + tools.decimalTimeSplit(myDailySession.sessionTimes[i])[1])
    //console.log(myDailySession.sessionTimesReadable[i][0] + ":" + myDailySession.sessionTimesReadable[i][1])
    console.log(myDailySession.sessionTimes[i])
  }
}
*/

function checkForFail() {
  const timeFrame = tools.timePassedSince(startTime)
  if (timeFrame > mySession.settings.timeBetweenCatches) {
    console.log("Took too long! No catch.")
    mySession.fails.push(timeFrame)
    myDailySession.fails.push([mySession.fails])
    mySession.stop()
    myDailySession.continue()
  }
}

function handleCatch() {
  const timeFrame = tools.timePassedSince(startTime)
  console.log(timeFrame)
  console.log("Nice catch!")
  mySession.catches.push(timeFrame)
  startTime = new Date()
}

// RUN STUFF

console.log(args)
console.log(" ")
console.log("### Welcome to the PaceBreaker backend ###\n")

// call functions

// Initiate Session

// Check if the Main.js is called by UserInterface.js
if (Object.keys(args).length > 2) { // called by User Interface
  myDailySessionSettings = new session.DailySessionSettings(args.howManySessions, args.startTime, args.endTime, args.pauseTimes)
  mySessionSettings = new session.SessionSettings(args.minCatches, args.stationCount, args.order, args.timeBetweenCatches, args.soundURL)
  console.log("called by UserInterface")
  for (var i = 0; i<mySessionSettings.stationCount; i++) {
    lockstations.push(lockstationsExistant[i])
  }
} else { // directy called
  myDailySessionSettings = new session.DailySessionSettings(5, 9.0, 19.9, null) //[13.0, 16.0]
  mySessionSettings = session.defaultSessionSettings()
  console.log("called directly")
  lockstations.push(lockstationsExistant)
}


var mySession = new session.Session(mySessionSettings, function(){
  // Session main loop
  //console.log("Session running.")

  //console.log(mySession.settings.stationCount)

  if (mySession.currentStation == null) {
    startTime = new Date()
    mySession.currentStation = 0
    lockstations = tools.shuffle(lockstations)
    lockstations[0].start()
    //console.log("currentStation set to 0")
  } else if (mySession.currentStation > -1 && mySession.currentStation < mySession.settings.stationCount -1 ) {
    // station nr between 0 and maximum -1
    //console.log("currentStation is " + mySession.currentStation)
    checkForFail()
    if (lockstations[mySession.currentStation].animalInFrontOfMe === true) {

      handleCatch()

      console.log("Animal in front of station " + mySession.currentStation)
      lockstations[mySession.currentStation].reset()
      // start next feeder
      lockstations[mySession.currentStation + 1].start()
      mySession.currentStation += 1

      console.log("current station: " + mySession.currentStation)
      console.log("station count: " + mySession.settings.stationCount)
    }
  } else if (mySession.currentStation == mySession.settings.stationCount - 1) {
    // station nr on maximum
    handleCatch()

    console.log("current station: " + mySession.currentStation)
    console.log("station count: " + mySession.settings.stationCount)

    startTime = null

      console.log("Turning feeder.")
      feeder1.turn()
      mySession.currentStation += 1
  } else if (mySession.currentStation == mySession.settings.stationCount) {
    // session over
    console.log("Session ended.")
    myDailySession.catches.push([mySession.catches])
    mySession.stop()
    myDailySession.continue()
  } else {
    console.log("currentStation is something else")
    console.log(mySession.currentStation)
  }

  /*
  switch(mySession.currentStation) {
    
    case null :
      startTime = new Date()
      mySession.currentStation = 0
      lockstations = tools.shuffle(lockstations)
      lockstations[0].start()
      console.log("currentStation set to 0")
      break
    case 0:
      console.log("currentStation is 0")
      checkForFail()
      // TODO: call handleCatch() also before the animal reaches the station. maybe it gave up.
      if (lockstations[0].animalInFrontOfMe === true) {
        console.log("Animal in front of station 0.")

        handleCatch()

        lockstations[0].reset()
        // start next feeder
        lockstations[1].start()
        mySession.currentStation += 1
      }
      break
    case 1:
      console.log("currentStation is 1")
      checkForFail()
      if (lockstations[1].animalInFrontOfMe === true) {

        handleCatch()

        console.log("Animal in front of station 1.")
        lockstations[1].reset()
        // start next feeder
        lockstations[2].start()
        mySession.currentStation += 1
      }
      break
    case 2:
      console.log("currentStation is 2")
      checkForFail()
      if (lockstations[2].animalInFrontOfMe === true) {

        handleCatch()

        console.log("Animal in front of station 2.")
        lockstations[2].reset()
        // start next feeder
        lockstations[3].start()
        mySession.currentStation += 1
      }
      break
    case 3:
      console.log("currentStation is 3")
      checkForFail()
      if (lockstations[3].animalInFrontOfMe === true) {

        handleCatch()

        console.log("Animal in front of station 3.")
        lockstations[3].reset()
        // start next feeder
        lockstations[4].start()
        mySession.currentStation += 1
      }
      break
    case 4:
      console.log("currentStation is 4")
      checkForFail()
      if (lockstations[4].animalInFrontOfMe === true) {

        handleCatch()

        console.log("Animal in front of station 4.")
        lockstations[4].reset()
        // start next feeder
        mySession.currentStation += 1
      }
      break
    case 5: // animal has done it and can now go to feeder

      //handleCatch()
      startTime = null

      console.log("Turning feeder.")
      feeder1.turn()
      mySession.currentStation += 1
      break
    case 6: // session over
      console.log("Session ended.")
      myDailySession.catches.push([mySession.catches])
      mySession.stop()
      myDailySession.continue()
      break
    default:
      console.log("currentStation is something else")
  }
  */


})
var myDailySession = new session.DailySession(mySession, myDailySessionSettings)


// MQTT Handlers

connections.mqttClient.on('message', function (topic, message) {
  // message is Buffer
  console.log(topic + " " + message)
  var isTrueSet = (message == 'true' || message == 'True' || message == 'TRUE'); // convert message (buffer) to bool

  
  switch (topic) {
    case 'lockstation0/animalInFront': // to be replaced with lockstation0 name
      //lockstations[0].animalInFrontOfMe = isTrueSet
      setAnimalInFront(0, isTrueSet)
      console.log("MQTT - AnimalInFront: "+ " 0 " + isTrueSet)
      break
    case 'lockstation1/animalInFront': // to be replaced with lockstation0 name
      //lockstations[1].animalInFrontOfMe = isTrueSet
      setAnimalInFront(1, isTrueSet)
      console.log("MQTT - AnimalInFront: "+ " 1 " + isTrueSet)
      break
    case 'lockstation2/animalInFront': // to be replaced with lockstation0 name
      //lockstations[2].animalInFrontOfMe = isTrueSet
      setAnimalInFront(2, isTrueSet)
      console.log("MQTT - AnimalInFront: "+ " 2 " + isTrueSet)
      break
    case 'lockstation3/animalInFront': // to be replaced with lockstation0 name
      //lockstations[3].animalInFrontOfMe = isTrueSet
      setAnimalInFront(3, isTrueSet)
      console.log("MQTT - AnimalInFront: "+ " 3 " + isTrueSet)
      break
    case 'lockstation4/animalInFront': // to be replaced with lockstation0 name
      //lockstations[4].animalInFrontOfMe = isTrueSet
      setAnimalInFront(4, isTrueSet)
      console.log("MQTT - AnimalInFront: "+ " 4 " + isTrueSet)
      break
    case 'system/stop':
      process.exit() // quit application
      break
    default:
      console.log("default: " + message.toString())
  }

  //connections.mqttClient.end()
})

function setAnimalInFront(id, value) {
  for (object of lockstations) {
    if (object.id === id) {
      object.animalInFrontOfMe = value
    }
  }
}


// Start Session
//mySession.start()
//console.log(lockstations)

// HOTFIX !!!!!!!
//mySession.settings.stationCount = mySession.settings.stationCount + 1
// DELETE As SOON AS POSSIBLE

myDailySession.start()

console.log("Session Times: " + myDailySession.sessionTimes)

console.log("\nPaceBreaker - Stop Pacing. Start Chasing!")
console.log(" ")
