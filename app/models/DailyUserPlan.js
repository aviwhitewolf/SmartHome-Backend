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

  connectedHomeLimit : {
    type : Number,
    default : 0
  },


  connectedHome : {
    type : Number,
    default : 0
  },

  connectedDeviceLimit : {
    type : Number,
    default : 0
  },

  connectedRoomLimit : {
    type : Number,
    default : 0
  },


  connectedRoom : {
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

  requestPerDay : {
    type : Number,
    default : 0
  },

  requestPerDayLimit :{
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
