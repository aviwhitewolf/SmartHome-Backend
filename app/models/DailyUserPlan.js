const mongoose = require('mongoose')
const Schema = mongoose.Schema
const time = require('../libs/timeLib')

const DailyUserPlan = new Schema({
  
  userId : {
    type : String,
    default : '',
    index   : true,
    unique  : true
  },

  homeLimit : {
    type : Number,
    default : 0
  },

  deviceLimit : {
    type : Number,
    default : 0
  },

  roomLimit : {
    type : Number,
    default : 0
  },

  connectedDevice : {
    type : Number,
    default : 0
  },

  connectedDeviceLimit : {
    type : Number,
    default : 0
  },

  roomName : {
    type : Number,
    default : 0
  },

  requestPerDay : {
    type : Number,
    default : 0
  },

  lastModified: {
    type: Date,
    default: time.now()
  },

  createdOn: {
    type: Date,
    default: time.now()
  }

})

module.exports = mongoose.model('DailyUserPlan', DailyUserPlan)
