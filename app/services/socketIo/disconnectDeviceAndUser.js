const mongoose = require('mongoose');
const logger = require('./../../libs/loggerLib.js');
const time = require('./../../libs/timeLib');
const config = require('../../config/config')
const tokenLib = require("./../../libs/tokenLib.js");
const check = require("./../../libs/checkLib.js");
const response = require('./../../libs/responseLib');
const redisLib = require('./../../libs/redisLib');
// const eventEmitter = new events.EventEmitter();

const Redis = require("ioredis");
const redis = new Redis();

/*

* For Highlighted text
! For Errors
? Answers and questions

TODO : For Todos 

*/

const deviceHashName = config.constants.ConnectedDevice;
const userHashName = config.constants.ConnectedUser;

let disconnectDeviceAndUser = (data) => {

    return new Promise((resolve, reject) => {

        try {

            let verifyToken = (data) => {

                return new Promise((resolve, reject) => {

                    try {

                        tokenLib.verifyClaimWithoutSecret(data.authToken, (err, user) => {

                            if (err) {

                                logger.error('Internal server Error - while verifying token or token expired', 'SocketIo : set-user : setUser : verifyToken', 7, err)
                                let apiResponse = response.generate(true, 'Token expired', 400, null)
                                reject(apiResponse)

                            } else {
                                data.userId = user.data.userId
                                resolve(data)

                            }
                        })

                    } catch (err) {

                        logger.error('Internal server Error', 'SocketIo : set-user : setUser : verifyToken', 10, err)
                        let apiResponse = response.generate(true, 'Internal server error', 500, null)
                        reject(apiResponse)

                    }

                })

            }

            let deleteDeviceFromRedis = (input) => {

                return new Promise((resolve, reject) => {

                    try {

                        let data = input.data
                        let arrayToDelete = []
                        data.deleteUserFromRedis = false

                        for (let index = 0; index < data.devices.length; index++) {

                            let device = data.devices[index];
                            let subArray = []

                            let typeText = "", socketText = "";

                            typeText = (device.hasOwnProperty("software") ? "softwareConnected" : "harwardConnected")
                            socketText = (device.hasOwnProperty("software") ? "socketId1" : "socketId2")

                            subArray.push("hdel", deviceHashName, `${device.deviceId}.homeId`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", deviceHashName, `${device.deviceId}.roomId`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", deviceHashName, `${device.deviceId}.userId`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", deviceHashName, `${device.deviceId}.deviceId`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", deviceHashName, `${device.deviceId}.state`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", deviceHashName, `${device.deviceId}.voltage`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", deviceHashName, `${device.deviceId}.extra`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", deviceHashName, `${device.deviceId}.${typeText}`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", deviceHashName, `${device.deviceId}.${socketText}`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", deviceHashName, `${device.deviceId}.${socketText}`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hincrby", userHashName, `${data.userId.connectedDevice}`, -1)
                            arrayToDelete.push(subArray)
                            subArray = []

                            if (index === data.devices.length - 1) {

                                data.arrayToDelete = arrayToDelete

                                redis
                                    .pipeline(
                                        data.arrayToDelete
                                    )
                                    .exec((err, result) => {

                                        if (err) {

                                            return reject(response.generate(true, 'Unable to delete data drom realtime database', 500, null))

                                        } else if (!check.isEmpty(result[0][1][0])) {

                                            if (result[0][10][0] <= 0) data.deleteDeviceFromRedis = true

                                            return resolve(response.generate(true, 'Device details deleted successfully from realtime database', 200, data))

                                        } else {

                                            return reject(response.generate(true, 'Unable to delete data drom realtime database', 500, null))

                                        }
                                    })
                            }
                        }

                    } catch (err) {

                        logger.error('Internal server Error', 'SocketIo : set-user : setUser : addUserAndDeviceToRedis', 10, err)
                        let apiResponse = response.generate(true, 'Internal server error', 500, null)
                        reject(apiResponse)
                    }
                })
            }

            let deleteUserFromRedis = (input) => {

                return new Promise((resolve, reject) => {

                    try {

                        let data = input.data
                        let arrayToDelete = []
                        let subArray = []

                        if (data.deleteDeviceFromRedis) {

                            subArray.push("hdel", userHashName, `${data.userId}.homes`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", userHashName, `${data.userId}.homeLimit`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", userHashName, `${data.userId}.connectedHome`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", userHashName, `${data.userId}.connectedRoomLimit`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", userHashName, `${data.userId}.connectedRoom`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", userHashName, `${data.userId}.requestPerDayLimit`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", userHashName, `${data.userId}.requestPerDay`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", userHashName, `${data.userId}.connectedDeviceLimit`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", userHashName, `${data.userId}.connectedDevice`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            subArray.push("hdel", userHashName, `${data.userId}.userId`)
                            arrayToDelete.push(subArray)
                            subArray = []

                            redis
                                .pipeline(data.arrayToDelete)
                                .exec((err, result) => {

                                    if (err) {

                                        return reject(response.generate(true, 'Unable to delete user data from realtime database', 500, null))

                                    } else if (result[0][1][0]) {

                                        /*
                                        TODO : Emit a event to update user data to mongodb
                                        */
                                        return resolve(response.generate(true, 'User details deleted successfully from realtime database', 200, data))

                                    } else {

                                        return reject(response.generate(true, 'Unable to delete user data from realtime database', 500, null))

                                    }

                                })

                        } else {

                            return resolve(response.generate(true, 'Nothing to delete, still some device are connected', 200, data))

                        }

                    } catch (err) {

                        logger.error('Internal server Error', 'SocketIo : set-user : setUser : addUserAndDeviceToRedis', 10, err)
                        let apiResponse = response.generate(true, 'Internal server error', 500, null)
                        reject(apiResponse)

                    }

                })

            }

        } catch (error) {

            logger.error('Internal server Error', 'socketLib : services : socketIo : disconnectDeviceAndUser', 10, err)
            let apiResponse = response.generate(true, 'Internal server error', 500, null)
            reject(apiResponse)

        }

    })

}

module.exports = {
    disconnectDeviceAndUser: disconnectDeviceAndUser
}