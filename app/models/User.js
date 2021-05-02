'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let userSchema = new Schema({

  userId    : {
    type    : String,
    default : '',
    index   : true,
    unique  : true
  },
  
  firstName : {
    type    : String,
    default : '',
    trim    : true,
  },

  lastName  : {
    type    : String,
    default : '',
    trim    : true,
  },
  password  : {
    type    : String,
    default : ''
  },

  email     : {
    type    : String,
    default : ''
  },

  mobileNumber : {
    type       : Number,
    default    : 0
  },

  createdOn : {
    type    : Date,
    default : ""
  },

  country   : {
    type    : String,
    default : "",
    trim    : true,
  }


})


mongoose.model('User', userSchema);