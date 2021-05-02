const mongoose = require('mongoose')
const Schema = mongoose.Schema
const time = require('../libs/timeLib')

const Home = new Schema({
  
  homeId : {
    type    : String,
    default : '',
    index   : true,
    unique  : true,
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

  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
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
  },
  
  voltage   : {
    type    : Number,
    default : 0 
  }

})

module.exports = mongoose.model('Home', Home)
