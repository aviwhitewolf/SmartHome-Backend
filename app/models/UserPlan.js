const mongoose = require('mongoose')
const Schema = mongoose.Schema
const time = require('../libs/timeLib')

const UserPlan = new Schema({
  
  userPlanId : {
    type    : String,
    default : '',
    index   : true,
    unique  : true,
    require : true  
  },

  userId : {
    type : String,
    default : '',
  },

  planId : {
    type : String,
    default : ''
  },

  startDate : {
    type: Date,
    default: time.now()
  },

  endDate  : {
    type: Date,
    default: time.now()
  },

  lastModified: {
    type: Date,
    default: time.now()
  },

  createdOn: {
    type: Date,
    default: time.now()
  },

  isDelete : {
    type : Number,
    default : 0
  }

})

module.exports = mongoose.model('UserPlan', UserPlan)
