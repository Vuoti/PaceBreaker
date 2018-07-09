/**
 * Get a random floating point number between `min` and `max`.
 *
 * @param {number} min - min number
 * @param {number} max - max number
 * @return {number} a random floating point number
 */
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

module.exports = {
  randomFloatBetween: function(min, max) {
    return getRandomFloat(min, max)
  },
  // sortArray
  //    Takes an array and if there are numbers it sorts them from small to big
  //    example: [1,4,2] -> [1,2,4]
  //
  sortArray: function(array) {
    return array.sort(function(a,b) { return a - b;})
  },
  round: function(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  },
  // decimalTimeSplit
  //    Converts time from float to normal readable form [hours, minutes]
  //    example: 13.5 -> [13,30]
  //
  decimalTimeSplit: function(timeOld) {
    
    var min = timeOld * 1000 % 1000 /1000; //0.2
    var hour = timeOld - min; //3
    min = min.toFixed(2)*100
    hour = parseInt(hour)
    // now converting to normal hours and minutes
    if (hour > 23) { console.log("Hours: " + i + " is incorrect. Please enter a number between 0 and 23.")}
    min = parseInt((min/100)*60)
    return [hour, min]
    
  },
  // getCurrentTime
  //    Gets the current time and returns it as [hours, minutes]
  //    example: [13,30]
  //
  getCurrentTime: function() {
    var t = new Date()
    var currentHour = t.getHours()
    var currentMinute = t.getMinutes()
    var currentTime = [currentHour, currentMinute]
    return currentTime
  },
  timePassedSince: function(start) {
    return Math.abs(new Date() - start)
  },
  shuffle: function(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }
}
