//
//  NOTES:
//
//
//  Dates:
//    For easier calculations dates are set as floats. 13:30 would therefore be 13.5
//    In order to convert a date to a readable form, use tools.decimalTimeSplit(floatDate)
//    This will return an array with hours and minutes like [13,30]
//

var tools = require("./tools")

var ii = 0 // just for testing purposes

module.exports = {
  Session: function(sessionSettings, doThis) { // pass in a closure function when calling
    const sessionLoopInterval = 33 // milliseconds -> 30 excecutions per second
    var me = this
    this.active = false
    this.loop = undefined
    this.settings = sessionSettings
    this.mainLoop = doThis
    this.catches = null
    this.fails = null
    this.currentStation = null

    this.start = function() {
      if (me.mainLoop === undefined) {
        console.log("No closure function provided on Session creation. Can't run.")
      } else {
        this.catches = []
        this.fails = []
        me.active = true
        me.loop = setInterval(this.run, sessionLoopInterval) // start loop
      }
    }

    this.stop = function() {
      this.active = false
      if (me.loop) {
        clearInterval(me.loop) // end loop
        me.loop = undefined
      }
      this.catches = null
      this.fails = null
      this.currentStation = null
    }

    this.run = function() {
      //console.log(doThis)
      if (!me.active) {
        if (me.loop) {
          clearInterval(me.loop) // end loop
          me.loop = undefined
        }
        return
      }
      //console.log("hllo")
      //console.log(typeOf(this.mainLoop))
      me.mainLoop()
      // Do stuff

      /*
      ++ii
      if (ii >= sessionLoopInterval) {
        me.active = false
      }
      */

    }

  },
  SessionSettings: function(minCatches, numberOfStations, order, timeBetweenCatches, soundURL) {
    this.minCatches = minCatches
    this.stationCount = numberOfStations
    this.order = order // string
    this.timeBetweenCatches = timeBetweenCatches // milliseconds
    this.soundURL = soundURL
  },
  defaultSessionSettings: function() {
    const minCatches = 5
    const stationCount = 5
    const order = "random"
    const timeBetweenCatches = 5000 // milliseconds
    const soundURL = "/defaultSound.mp3"
    return new module.exports.SessionSettings(minCatches, stationCount, order, timeBetweenCatches, soundURL)
  },
  DailySession: function(Session, DailySessionSettings) {
    const dailySessionLoopInterval = 5000 // every five seconds
    var me = this
    this.active = false
    this.loop = undefined
    this.catches = [] // consists of catch times in their respective arrays
    this.fails = [] // consists of fail times
    this.session = Session
    this.dailySessionSettings = DailySessionSettings
    this.sessionTimes = null
    this.sessionTimesReadable = null

    this.generateSessionTimes = function() {
      var times = []
      const startTime = this.dailySessionSettings.startTime
      const endTime = this.dailySessionSettings.endTime
      const howManyTimes = this.dailySessionSettings.howManyTimes
      const pauseTimes = this.dailySessionSettings.pauseTimes
      const pauseDuration = 0.5 // 30 minutes
      // generate random times and put them in the time array
      for (var i = 0; i < howManyTimes; i++) {
        //console.log(times)
        var possibleTime = false; // assume we don't have a possible time
        while (!possibleTime) { // as long as we don't have it,
          // generate a new time
          var time = tools.randomFloatBetween(startTime, endTime)
          time = tools.round(time, 2)
          //console.log("generated: " + time)
          // if there are pause times
          if (pauseTimes != null) {
            if (pauseTimes.length < 1) {
              return
            } else {
              // say this time is possible
              var possible = true
              // loop over pause times
              for (let pause of pauseTimes) {
                /* Examples
                pause = 12.25
                time = 12.5
                diff = 0.25 -> match

                pause = 12.5
                time = 13.0
                diff = -0.5 -> no match

                pause = 12.5
                time = 10.0
                diff = 2.5 -> no match
                */
                // look for matches
                if ((time - pause) < pauseDuration && (time - pause) >= 0.0) {
                  // match
                  //console.log(time-pause)
                  //console.log("impossible: " + time)
                  possible = false // oh, we were wrong. it's not possible
                }
              } // end for
              if (possible) { // great! we were right. it's possible.
                //console.log("pushed possible: " + time)
                times.push(time)
                possibleTime = true
              }
            }
          } else { // we don't have any pauses, so the time will always fit
            times.push(time)
            //console.log("pushed cause no pauses: " + time)
            possibleTime = true
          }
        } // end while
      }
      times = tools.sortArray(times) // make the times go after another
      this.sessionTimes = times // add times to object
      //console.log("sessionTimes " + times)

      // convert to readable format

      console.log("Session times are generated. Converting now..")
      me.sessionTimesReadable = []
      for (let sessionTime of me.sessionTimes) {
        me.sessionTimesReadable.push(tools.decimalTimeSplit(sessionTime))
      }

    }

    this.start = function() {
      this.generateSessionTimes()
      this.active = true
      this.loop = setInterval(this.run, dailySessionLoopInterval) // start loop
    }

    this.continue = function() {
      if (this.sessionTimes.length > 0) {
        this.active = true
        this.loop = setInterval(this.run, dailySessionLoopInterval) // start loop
      } else {
        console.log("Daily Session is over.")
        console.log("Catches: " + me.catches)
        console.log("Fails: " + me.fails)
        console.log("\nThanks for using PaceBreaker!")
        console.log("Stop Pacing. Start Chasing!\n")
        process.exit() // quit application
      }

    }

    this.run = function() {
      if (!me.active) {
        if (me.loop) {
          clearInterval(me.loop) // end loop
          me.loop = null
        }
        return
      }
      if (!me.sessionTimes) {
        console.log("Can't run dailySession. No session times defined.")
        return
      }
      // DO THIS

      //console.log(me.sessionTimes)

      // get current time
      const currentTime = tools.getCurrentTime()
      // compare them


      for (var i = 0; i < me.sessionTimesReadable.length; i++) {
        let sessionTime = me.sessionTimesReadable[i]
        const hoursMatch = sessionTime[0] === currentTime[0]
        const minutesMatch = sessionTime[1] === currentTime[1]
        console.log("sessionTime: " + sessionTime)
        console.log("currentTime: " + currentTime)
        console.log("hours matching = " + hoursMatch + "\nminutes matching = " + minutesMatch)

        // if they are equal, log "feeding time" exactly ONCE
        // also run Session
        if (hoursMatch && minutesMatch) {
          console.log("\nIt's feeding time!")
          console.log("Starting Session...")
          me.active = false
          // remove current time from sessionTimes and sessionTimesReadable
          me.sessionTimesReadable.splice(i, 1);
          me.sessionTimes.splice(i, 1);

          me.session.start()
          return
        }
      }

      /*
      for (let sessionTime of me.sessionTimesReadable) {
        const hoursMatch = sessionTime[0] === currentTime[0]
        const minutesMatch = sessionTime[1] === currentTime[1]
        console.log("sessionTime: " + sessionTime)
        console.log("currentTime: " + currentTime)
        console.log("hours matching = " + hoursMatch + "\nminutes matching = " + minutesMatch)

        // if they are equal, log "feeding time" exactly ONCE
        // also run Session
        if (hoursMatch && minutesMatch) {
          console.log("\nIt's feeding time!")
          console.log("Starting Session...")
          me.active = false
          // remove current time from sessionTimes and sessionTimesReadable

          me.session.start()
          return
        }
      }*/

      /*
      ++ii
      if (ii >= 30) {
        me.active = false
      }*/

      // Do stuff
    }
  },
  DailySessionSettings: function(howManyTimes, startTime, endTime, pauseTimes) {
    this.howManyTimes = howManyTimes
    this.startTime = startTime
    this.endTime = endTime
    this.pauseTimes = pauseTimes || null // array of 30 minute long pause events
  },
  defaultDailySessionSettings: function() {
    const howManyTimes = 4
    const startTime = 7.0 // 07:00 Uhr
    const endTime = 19.0 // 19:00 Uhr
    const pauseTimes = null
    return module.exports.DailySessionSettings(howManyTimes, startTime, endTime, pauseTimes)
  }
}
