const mongoose = require('mongoose');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib');

const DeviceModel = mongoose.model('Device')

//get single device function
let getSingleDeviceFunction = (req, res) => {
 
  try {
      
    DeviceModel.findOne({'userId' : req.user.userId, 'deviceId' : req.body.deviceId, 'homeId': req.body.homeId })
    .select('-__v -_id -userId')
    .lean()
    .exec((err, result) => {

        if (err) {
          
            logger.error(err.message, 'Device Controller: getSingleDevice', 10, err)
            let apiResponse = response.generate(true, 'Failed to find device details', 500, null)
            res.status(apiResponse.status).send(apiResponse)
        
        } else if (check.isEmpty(result)) {
        
            logger.info('No device found', 'Device Controller:getSingleDevice', 1)
            let apiResponse = response.generate(true, 'No Device Found', 404, null)
            res.status(apiResponse.status).send(apiResponse)
        
        } else {
        
            let apiResponse = response.generate(false, 'Device found', 200, result);
            res.status(apiResponse.status).send(apiResponse)
        
        }
    })

  } catch (err) {
        
    logger.error('Internal server Error', 'Device Controller: getSingleDeviceFunction', 10, err)
    let apiResponse = response.generate(true, 'Internal server error', 500, null)
    res.status(apiResponse.status).send(apiResponse)

  } 

}// end get single device function


module.exports = {
getDevice    : getSingleDeviceFunction 
}// end exports