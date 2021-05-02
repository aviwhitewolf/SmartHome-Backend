const mongoose = require('mongoose')
const Schema = mongoose.Schema
const time = require('../libs/timeLib')

const Room = new Schema({
  
  roomId : {
    type    : String,
    default : '',
    index   : true,
    unique  : true,
    require : true  
  },

  homeId : {
    type    : String,
    default : '',
    require : true  
  },

  userId: {
    type: String,
    require : true 
  },

  name : {
    type : String,
    trim : true,
    require : true  
  },

  imageUrl : {
      type : String,
      trim : true
  },

  lastModified: {
    type: Date,
    default: time.now()
  },

  createdOn: {
    type: Date,
    default: time.now()
  },

  activeDevices : {
    type    : Number,
    default : 0
  }

})

module.exports = mongoose.model('Room', Room)
