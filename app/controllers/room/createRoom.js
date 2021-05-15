const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../../libs/timeLib');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib')
const HomeModel = mongoose.model('Home')
const RoomModel = mongoose.model('Room')
const DailyUserPlanModel = mongoose.model('DailyUserPlan')

// start home creation function
let createRoomFunction = async (req, res) => {

    let checkUserDailyPlan = () => {

        return new Promise((resolve, reject) => {

            try {

                DailyUserPlanModel.findOne({ userId: req.user.userId })
                    .exec((err, result) => {

                        if (err) {

                            logger.error(err.message, 'roomController : createRoomFunction() : checkDailyUserPlan()', 10, err)
                            let apiResponse = response.generate(true, 'Failed to update daily user plan', 500, null)
                            reject(apiResponse)

                        } else if (check.isEmpty(result)) {

                            logger.error('Daily user plan not found.', 'roomController : createRoomFunction() : checkDailyUserPlan()', 4)
                            let apiResponse = response.generate(true, 'Daily user plan not found', 403, null)
                            reject(apiResponse)

                        } else {

                            if (result.connectedRoomLimit - 1 >= 0) {
                                req.connectedRoomLimit = result.connectedRoomLimit
                                resolve()

                            } else {

                                logger.info('Upgrade your plan to add more rooms', 'roomController : createRoomFunction() : checkDailyUserPlan()', 5)
                                let apiResponse = response.generate(true, 'Upgrade your plan to add more rooms, current limit : ' + result.connectedRoomLimit, 403, null)
                                reject(apiResponse)

                            }
                        }
                    })


            } catch (err) {

                logger.error('Internal server Error', 'roomController : createRoomFunction() : checkDailyUserPlan()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }

    let findHome = () => {

        return new Promise((resolve, reject) => {

            try {

                HomeModel.findOne({ homeId: req.body.homeId, userId: req.user.userId }, (err, homeDetails) => {

                    if (err) {

                        logger.error('Failed to retrieve home data', 'roomController : findHome()', 10, err)
                        let apiResponse = response.generate(true, 'Failed to find home details', 500, null)
                        reject(apiResponse)

                    } else if (check.isEmpty(homeDetails)) {

                        logger.info('No home found', 'roomController : findHome()', 1)
                        let apiResponse = response.generate(true, 'No home details found', 404, null)
                        reject(apiResponse)

                    } else {

                        logger.info('Home found', 'roomController : findHome()', 1)
                        resolve(homeDetails)

                    }

                })

            } catch (err) {

                logger.error('Internal server Error', 'roomController : findHome()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }

    let createRoom = () => {

        return new Promise((resolve, reject) => {

            try {

                let today = time.now();
                let roomId = shortid.generate();

                let newRoom = new RoomModel({
                    roomId: roomId,
                    homeId: req.body.homeId,
                    userId: req.user.userId,
                    name: req.body.roomName,
                    imageUrl: req.body.imageUrl || '',
                    createdOn: today,
                    lastModified: today,
                    activeDevices: 0
                })

                newRoom.save((err, result) => {

                    if (err) {

                        logger.error(err.message, 'roomController : createRoom()', 10, err)
                        let apiResponse = response.generate(true, 'Failed to create new room', 500, null);
                        reject(apiResponse)

                    } else if (check.isEmpty(result)) {

                        logger.info('No device found', 'roomController : createRoom()', 5)
                        let apiResponse = response.generate(true, 'Failed to create new room', 404, null);
                        reject(apiResponse)

                    } else {

                        req.roomId = roomId
                        resolve(req)
                    }

                })

            } catch (err) {

                logger.error('Internal server Error', 'roomController : createRoom()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }

    let updateUserDailyPlan = () => {

        return new Promise((resolve, reject) => {

            try {

                let updateDailyUserPlan = {

                    connectedRoomLimit: req.connectedRoomLimit - 1,
                    // deviceLimit: req.deviceLimit - (req.body.devices.length || 0),
                    lastModified: time.now()

                }

                DailyUserPlanModel.updateOne({ 'userId': req.user.userId }, updateDailyUserPlan)
                    .exec((err, result) => {

                        if (err) {

                            logger.error(err.message, 'roomController : createRoomFunction() : updateDailyUserPlan()', 10, err)
                            let apiResponse = response.generate(true, 'Failed to update daily user plan', 500, null)
                            reject(apiResponse)

                        } else {

                            resolve()

                        }
                    })

            } catch (err) {

                logger.error('Internal server Error', 'homeController : createRoomFunction() : updateDailyUserPlan()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }

    checkUserDailyPlan(req, res)
        .then(findHome)
        .then(createRoom)
        .then(updateUserDailyPlan)
        .then((resolve) => {

            let apiResponse = response.generate(false, 'New room created successfully', 200, resolve);
            res.status(apiResponse.status).send(apiResponse)

        })
        .catch(async (err) => {

            res.status(err.status).send(err);

        })

} // end of devicecreation function

module.exports = {
    createRoom: createRoomFunction
}// end exports