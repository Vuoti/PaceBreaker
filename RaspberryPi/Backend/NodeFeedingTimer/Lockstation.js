const tools = require("./tools.js")
const connections = require("./connections.js")

module.exports = {
  Lockstation: function(id) {
    this.active = false
    this.name = 'lockstation' + id
    this.id = id
    this.animalInFrontOfMe = null

    this.start = function() {
      this.active = true
      var activeTopic =  this.name + '/active'
      connections.mqttClient.publish(activeTopic, 'true')
      console.log("Station " +  this.id + " is active")
    }
    this.reset = function() {
      this.active = false
      var activeTopic =  this.name + '/active'
      //connections.mqttClient.publish(this.name + '/animalInFront', 'false')
      connections.mqttClient.publish(activeTopic, 'false')
      this.animalInFrontOfMe = false //null
    }
  }
}
