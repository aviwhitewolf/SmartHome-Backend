const mongoose = require('mongoose')
const Schema = mongoose.Schema
const time = require('../libs/timeLib')

const Plan = new Schema({
  
  planId : {
    type    : String,
    default : '',
    index   : true,
    unique  : true,
    require : true  
  },

  planName : {
    type    : String,
    default : '',
    unique  : true,
    require : true  
  },

  description: {
    type    : String,
    require : true 
  },

  connectedHomeLimit : {
    type : Number,
    require : true,
    default : 0  
  },

  connectedDeviceLimit : {
    type    : Number,
    default : 0
  },

  connectedRoomLimit : {
    type : Number,
    default : 0
  },

  requestPerDayLimit : {
    type    : Number,
    default : 0
  },

  price : {
    type    : Number,
    default : 0
  },

  currency : {
    type    : String,
    default : 'INR'
  },

  createdBy : {
    type    : String,
    require : true,
    default : ''
  },

  lastModifiedBy : {
    type    : String,
    require : true,
    default : ''
  },

  lastModified : {
    type    : Date,
    default : time.now()
  },

  createdOn: {
    type: Date,
    default: time.now()
  },

  isDelete : {
      type : Number,
      default : 0
  },

  isDeleteBy : {
    type    : String,
    default : ''
  },

  toShow   : {
    type   : Number,
    default : 0

  }

})

module.exports = mongoose.model('Plan', Plan)
