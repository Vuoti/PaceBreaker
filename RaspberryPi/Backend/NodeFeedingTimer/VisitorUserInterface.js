function VisitorUserInterface() {
  this.nextFeedingTime = null
  this.updateNextFeedingTime = function(newTime) {
    this.nextFeedingTime = newTime
  }
}
