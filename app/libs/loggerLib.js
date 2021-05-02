'use strict'
const logger = require('pino')()
const moment = require('moment')

// myErrorFunction is a definition of how the errors will be formatted in our system
let captureError = (errorMessage, errorOrigin, errorLevel, value = '', info = "") => {
  let currentTime = moment()

  let errorResponse = {
    timestamp    : currentTime,
    errorMessage : errorMessage,
    errorOrigin  : errorOrigin,
    errorLevel   : errorLevel,
    value        : value
  }
  if(info != "") errorResponse.info = info
  // console.log("\n==========================================================================\n")
  console.error(errorResponse)
  logger.error(errorResponse)
  return errorResponse
} // end captureError

let captureInfo = (message, origin, importance, info = "") => {
  let currentTime = moment()

  let infoMessage = {
    timestamp: currentTime,
    message: message,
    origin: origin,
    level: importance
  }
  if(info != "") infoMessage.info = info
  // console.log("\n==========================================================================\n")  
  console.log(infoMessage)
  logger.info(infoMessage)
  return infoMessage
} // end infoCapture

module.exports = {
  error: captureError,
  info: captureInfo
}
