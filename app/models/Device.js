const mongoose = require('mongoose')
const Schema = mongoose.Schema
const time = require('../libs/timeLib')

const Device = new Schema({
  
    deviceId  : {
        type    : String,
        default : '',
        unique  : true,
        index   : true,
        require : true 
      },
  
      userId    : {
        type    : String,
        require : true
      },

      homeId    : {
        type    : String,
        require : true
      },
      
      roomId : {
        type    : String,
        default : '',
        require : true  
      },
    
      name       : {
        type     : String,
        required : true
      },
      
      icon : {
        type : String,
        default : ''
      },
  
      createdOn : {
        type    : Date,
        default : time.now()
      },

      lastModified : {
        type    : Date,
        default : time.now()
      },
    
      state       : {
          type    : Number,
          default : 0,
      },
    
      voltage : {
          type    : Number,
          default : 0, 
      },
    
      extra       : [{
          type    : String,
          default : ''
      }]

})

module.exports = mongoose.model('Device', Device)
