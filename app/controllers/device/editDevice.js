const mongoose = require('mongoose');
const time = require('./../../libs/timeLib');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib');

const DeviceModel = mongoose.model('Device')

//edit single device
let editDeviceFunction = (req, res) => {

    try {

        let voltage = ((!isNaN(req.body.voltage) && req.body.voltage < 255) ? req.body.voltage : 0);

        let options = {
            name: req.body.deviceName,
            voltage: voltage,
            lastModified: time.now()
        }


        DeviceModel.updateOne({'userId' : req.user.userId, 
        'deviceId' : req.body.deviceId, 
        'homeId': req.body.homeId }, options)
        .exec((err, result) => {

            if (err) {

                logger.error(err.message, 'Home Controller:editSingleDeviceFunction', 10, err)
                let apiResponse = response.generate(true, 'Failed to edit device details', 500, null)
                res.status(apiResponse.status).send(apiResponse)
            
            } else if (check.isEmpty(result)) {
            
                logger.info('No device found', 'Device Controller: editSingleDeviceFunction', 1)
                let apiResponse = response.generate(true, 'No device found', 404, null)
                res.status(apiResponse.status).send(apiResponse)
            
            } else {
            
                let apiResponse = response.generate(false, 'Device details edited', 200, result)
                res.status(apiResponse.status).send(apiResponse)
            
            }
        });
                
    } catch (err) {
        
        logger.error('Internal server Error', 'Device Controller: editDeviceFunction', 10, err)
        let apiResponse = response.generate(true, 'Internal server error', 500, null)
        res.status(apiResponse.status).send(apiResponse)
    

    }

}// end edit single device

module.exports = {
 
    editDevice   : editDeviceFunction

}// end exports