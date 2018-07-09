const tools = require("./tools.js")
const connections = require("./connections.js")

module.exports = {
  Feeder: function() {
    this.active = false
    this.turns = 0
    this.turn = function() {
      connections.mqttClient.publish('feeder/turn', 'true')
    }
  }
}