const mongoose = require('mongoose');
const time = require('./../../libs/timeLib');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib')
const RoomModel = mongoose.model('Room')
const DeviceModel = mongoose.model('Device')

//edit room
let editRoomFunction = (req, res) => {

    //Create new home
    let editRoom = () => {

        return new Promise((resolve, reject) => {

            try {

                let today = time.now();

                let editRoom = {
                    name: req.body.roomName,
                    imageUrl: req.body.imageUrl || '',
                    lastModified: today
                }

                RoomModel.updateOne({
                    'roomId': req.body.roomId,
                    'userId': req.user.userId,
                    'homeId': req.body.homeId
                }, editRoom, (err, result) => {

                    if (err) {

                        logger.error(err.message, 'roomController : editRoom()', 10, err)
                        let apiResponse = response.generate(true, 'Failed to update room', 500, null);
                        reject(apiResponse)

                    } else if (check.isEmpty(result)) {

                        logger.info('No room found', 'roomController : editRoom()', 5)
                        let apiResponse = response.generate(true, 'Failed to update room', 404, null);
                        reject(apiResponse)

                    } else {

                        resolve()
                    }

                })

            } catch (err) {

                logger.error('Internal server Error', 'roomController : editRoom()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }// Create New home end

    let editDevice = () => {

        return new Promise((resolve, reject) => {

            try {

                let today = time.now();
                let devices = req.body.devices
                let updateErrors = [];

                devices.forEach(device => {

                    let deviceObject = {

                        name: device.deviceName,
                        icon: device.icon || '',
                        lastModified: today,
                        state: device.state,
                        voltage: device.voltage,
                        extra: device.extra

                    }


                    DeviceModel.updateOne({
                        'roomId': req.body.roomId,
                        'userId': req.user.userId,
                        'deviceId': device.deviceId,
                        'homeId': req.body.homeId
                    }, deviceObject, (err, result) => {

                        if (err) {

                            updateErrors.push({ 'deviceId': device.deviceId })
                            logger.error(err.message, 'roomController : createDevice()', 10, err)

                        } else if (check.isEmpty(result)) {

                            updateErrors.push({ 'deviceId': device.deviceId })

                        }

                    })


                });


                if (updateErrors.length < devices.length) {

                    resolve(updateErrors)

                } else {

                    let apiResponse = response.generate(true, 'Failed to update device', 500, updateErrors);
                    reject(apiResponse)

                }


            } catch (err) {

                logger.error('Internal server Error', 'roomController : editDevice()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })
    }


    editRoom(req, res)
        // .then(editDevice)
        .then((resolve) => {

            let apiResponse = response.generate(false, 'New room updated successfully', 200, resolve);
            res.status(apiResponse.status).send(apiResponse)

        })
        .catch((err) => {
            res.status(err.status).send(err);
        })

}//edit room end

module.exports = {
    editRoom: editRoomFunction
}// end exports