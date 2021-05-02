const mongoose = require('mongoose')
const Schema = mongoose.Schema
const time = require('../libs/timeLib')

const Admin = new Schema({
  
  adminId: {
    type    : String,
    default : '',
    unique  : true,
    index   : true,
    require : true 
  },

  firstName : {
    type    : String,
    default : '',
    trim    : true
  },

  lastName  : {
    type    : String,
    default : '',
    trim    : true
  },

  email     : {
    type    : String,
    default : ''
  },

  password  : {
    type    : String,
    default : ''
  },

  level : {
    type    : Number,
    default : 3
  },

  rights : {
    type : String,
    default : 'NR'
  },

  mobileNumber : {
    type       : Number,
    default    : 0
  },

  country   : {
    type    : String,
    default : "",
    trim    : true,
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
  }

})

module.exports = mongoose.model('Admin', Admin)
