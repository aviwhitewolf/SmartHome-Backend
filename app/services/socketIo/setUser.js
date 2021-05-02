const mongoose = require('mongoose');
const logger = require('./../../libs/loggerLib.js');
const time = require('./../../libs/timeLib');
const config = require('../../config/config')
const tokenLib = require("./../../libs/tokenLib.js");
const check = require("./../../libs/checkLib.js");
const response = require('./../../libs/responseLib');
const redisLib = require('./../../libs/redisLib');
const eventEmitter = new events.EventEmitter();


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

/* Models */
const UserModel = mongoose.model('User')
const RoomModel = mongoose.model('Room')
const DeviceModel = mongoose.model('Device')
const DailyUserPlanModel = mongoose.model('DailyUserPlan')


let setUsers = (data) => {

    return new Promise((resolve, reject) => {

        try {

            // TODO : check for validation, homeId, authToken

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
                                resolve()

                            }
                        })

                    } catch (err) {

                        logger.error('Internal server Error', 'SocketIo : set-user : setUser : verifyToken', 10, err)
                        let apiResponse = response.generate(true, 'Internal server error', 500, null)
                        reject(apiResponse)

                    }

                })

            }

            let checkUserFromRedisAndValidate = (data) => {

                data.userVerifiedFromRedis = false
                data.forward = false

                return new Promise((resolve, reject) => {

                    try {

                        /*
                        * Get User data from redis,from hash - ConnectedUser
                        ? homes, homeLimit, connectedhome, roomLimit, connectedRoom, requestPerDayLimit,
                        ? requestPerDay, connectedDeviceLimitLimit, connectedDevice, userId
                        ! If Not then follow the different process and add user to redis
                        * If yes then check for devices data from redis, from hash - ConnectedDevices 
                        */

                        redis
                            .pipeline()
                            .hmget(userHashName, `${data.userId}.homes`)
                            .hmget(userHashName, `${data.userId}.homeLimit`)
                            .hmget(userHashName, `${data.userId}.connectedHome`)
                            .hmget(userHashName, `${data.userId}.roomLimit`)
                            .hmget(userHashName, `${data.userId}.connectedRoom`)
                            .hmget(userHashName, `${data.userId}.requestPerDayLimit`)
                            .hmget(userHashName, `${data.userId}.requestPerDay`)
                            .hmget(userHashName, `${data.userId}.connectedDeviceLimit`)
                            .hmget(userHashName, `${data.userId}.connectedDevice`)
                            .hmget(userHashName, `${data.userId}.userId`)
                            .exec((err, result) => {

                                // "homes",                result[0][1][0]
                                // "homeLimit",            result[1][1][0]
                                // "connectedHome",        result[2][1][0]
                                // "roomLimit",            result[3][1][0]
                                // "connectedRoom",        result[4][1][0]
                                // "requestPerDayLimit",   result[5][1][0]
                                // "requestPerDay",        result[6][1][0]
                                // "connectedDeviceLimit", result[7][1][0]
                                // "connectedDevice",      result[8][1][0]
                                // "userId",               result[9][1][0]

                                if (!check.isEmpty(result[0][1][0])
                                    && !check.isEmpty(result[1][1][0])
                                    && !check.isEmpty(result[2][1][0])
                                    && !check.isEmpty(result[3][1][0])
                                    && !check.isEmpty(result[4][1][0])
                                    && !check.isEmpty(result[5][1][0])
                                    && !check.isEmpty(result[6][1][0])
                                    && !check.isEmpty(result[7][1][0])
                                    && !check.isEmpty(result[8][1][0])) {

                                    data.userHash = {
                                        "homes": JSON.parse(result[0][1][0]),
                                        "homeLimit": result[1][1][0],
                                        "connectedHome": result[2][1][0],
                                        "roomLimit": result[3][1][0],
                                        "connectedRoom": result[4][1][0],
                                        "requestPerDayLimit": result[5][1][0],
                                        "requestPerDay": result[6][1][0],
                                        "connectedDeviceLimit": result[7][1][0],
                                        "connectedDevice": result[8][1][0],
                                        "userId": result[9][1][0]
                                    }

                                    /*
                                    ? RequestPerDay check
                                    */
                                    if (data.userHash.requestPerDay >= data.userHash.requestPerDayLimit){
                                        
                                        return reject(response.generate(true, 'Today request quota is over, watch ad to get more request or update your plan', 400,  data))
                                    
                                    }
                                    /*
                                    ? If New Home, check homeLimit
                                    * Add New Home and Room, update home count and room count
                                    */
                                    if (data.userHash.homes[data.homeId] == undefined && (data.userHash.connectedHome + 1) < data.userHash.homeLimit) {

                                        data.userVerifiedFromRedis = true
                                        data.forward = true

                                        let homes = data.userHash.homes

                                        homes = {
                                            [data.homeId]: {
                                                [data.roomId]: data.homeId
                                            }
                                        }

                                        data.userHash.homes = JSON.stringify(homes)
                                        data.userHash.connecteHome = data.userHash.connecteHome + 1
                                        data.userHash.connectedRoom = data.userHash.connectedRoom + 1

                                        resolve(response.generate(true, 'Home and room added in redis', 200, data))


                                    /*
                                    ? Old Home and new room
                                    * Add new room to old home and update room count
                                    */
                                    } else if (data.userHash.homes[data.homeId][data.roomId] == undefined && (data.userHash.connectedRoom + 1) < data.userHash.connectedRoomLimit) {

                                        data.userVerifiedFromRedis = true
                                        data.forward = true

                                        let homes = data.userHash.homes

                                        homes[data.homeId][data.roomId] = data.homeId

                                        data.userHash.homes = JSON.stringify(homes)
                                        data.userHash.connectedRoom = data.userHash.connectedRoom + 1

                                        resolve(response.generate(true, 'Room added to redis', 200, data))

                                    /*
                                    ? If home and room both are present
                                    */
                                    } else if (data.userHash.homes[data.homeId] != undefined && data.userHash.homes[data.homeId][data.roomId] != undefined) {

                                        data.userVerifiedFromRedis = true
                                        data.forward = true

                                        resolve(response.generate(true, 'Home and room already present', 200, data))

                                    /*
                                    ? Else part
                                    */
                                    } else {

                                        reject(response.generate(true, 'Update your Plan, Home or room limit reached', 400, data))

                                    }

                                } else {
                                    data.forward = true
                                    reject(response.generate(true, 'User record not present in realtime database ', 400, data))

                                }

                            });

                    } catch (err) {

                        logger.error('Internal server Error', 'SocketLib : checkAndSetDataToRedis', 10, err)
                        reject(response.generate(true, 'Internal server error', 500, null))

                    }


                })

            }

            let addDeviceToRedis = (data) => {

                let data = data?.data

                return new Promise((resolve, reject) => {

                    try {

                        if (Array.isArray(data.devices) && data.devices.length > 0) {

                            let failureArray, successArray = []
                            let deviceCountCheck = data.userHash.connectedDevice;

                            /*
                            * Get devices data from redis, from hash - ConnectedDevices
                            ? homeId, roomId, userId, deviceId, state, voltage, extra
                            ! If Not then add the device to redis database
                            * If yes then just update softwareConnected or hardwareConneted = 'y' 
                            * and set socketId1 or socketId2
                            */

                            data.devices.forEach((device, index) => {

                                if (deviceCountCheck < data.userHash.connectedDeviceLimit) {
                                    redis
                                        .pipeline()
                                        .hmget(deviceHashName, `${device.deviceId}.deviceId`)
                                        .exec((err, deviceResult) => {

                                            // "deviceId", deviceResult[0][1][0]

                                            if (!check.isEmpty(deviceResult[0][1][0])) {

                                                let typeText = "", socketText = "";

                                                typeText = (device.hasOwnProperty("software") ? "softwareConnected" : "harwardConnected")
                                                socketText = (device.hasOwnProperty("software") ? "socketId1" : "socketId2")

                                                redis
                                                    .pipeline()
                                                    .hmset(deviceHashName, `${device.deviceId}.${typeText}`, 'y')
                                                    .hmset(deviceHashName, `${device.deviceId}.${socketText}`, device.socketId)
                                                    .exec((err, result) => {
                                                        if (err) failureArray.push(device.deviceId)

                                                        if (!check.isEmpty(result[0][1][0])
                                                            && !check.isEmpty(result[1][1][0]))
                                                            successArray.push(device.deviceId)

                                                        //Last Device
                                                        if (index === data.devices.length - 1)
                                                            resolve(response.generate(true, 'Device Added', 200, { success: successArray, failure: failureArray }))
                                                    })

                                            } else {

                                                let typeText = "", socketText = "";

                                                typeText = (device.hasOwnProperty("software") ? "softwareConnected" : "harwardConnected")
                                                socketText = (device.hasOwnProperty("software") ? "socketId1" : "socketId2")


                                                redis
                                                    .pipeline()
                                                    .hmset(deviceHashName, `${device.deviceId}.homeId`, device.homeId)
                                                    .hmset(deviceHashName, `${device.deviceId}.roomId`, device.roomId)
                                                    .hmset(deviceHashName, `${device.deviceId}.userId`, device.userId)
                                                    .hmset(deviceHashName, `${device.deviceId}.deviceId`, device.deviceId)
                                                    .hmset(deviceHashName, `${device.deviceId}.state`, device.state)
                                                    .hmset(deviceHashName, `${device.deviceId}.voltage`, device.voltage)
                                                    .hmset(deviceHashName, `${device.deviceId}.extra`, device.extra)
                                                    .hmset(deviceHashName, `${device.deviceId}.${typeText}`, 'y')
                                                    .hmset(deviceHashName, `${device.deviceId}.${socketText}`, device.socketId)
                                                    .exec((err, result) => {

                                                        if (err) failureArray.push(device.deviceId)

                                                        else if (!check.isEmpty(result[0][1][0])
                                                            && !check.isEmpty(result[1][1][0])
                                                            && !check.isEmpty(result[2][1][0])
                                                            && !check.isEmpty(result[3][1][0])
                                                            && !check.isEmpty(result[4][1][0])
                                                            && !check.isEmpty(result[5][1][0])
                                                            && !check.isEmpty(result[6][1][0])
                                                            && !check.isEmpty(result[7][1][0])
                                                            && !check.isEmpty(result[8][1][0])
                                                            )
                                                            successArray.push(device.deviceId)

                                                        //Last Device
                                                        if (index === data.devices.length - 1) {
                                                            data.userHash.connectedDevice = deviceCountCheck
                                                            resolve(response.generate(true, 'Device Added', 200, { success: successArray, failure: failureArray }))
                                                        }
                                                    });
                                            }

                                        });

                                } else {

                                    data.userHash.connectedDevice = deviceCountCheck
                                    return resolve(response.generate(true, 'Device Added, Max Device Limit reached', 200, { success: successArray, failure: failureArray }))

                                }
                            });

                        } else {

                            logger.error('Devices array is empty', 'SocketLib : checkUserFromRedis', 2)
                            reject(response.generate(true, 'Devices array is empty', 400, null))

                        }

                    } catch (err) {

                        logger.error('Internal server Error', 'SocketIo : set-user : setUser : adddeviceToRedis', 10, err)
                        let apiResponse = response.generate(true, 'Internal server error', 500, null)
                        reject(apiResponse)

                    }

                })

            }

            let updateRedisDailyUserPlan = (data) => {

                return new Promise((resolve, reject) => {

                    try {


                    } catch (err) {

                        logger.error('Internal server Error', 'SocketIo : set-user : setUser : updateRedisDailyUserPlan', 10, err)
                        let apiResponse = response.generate(true, 'Internal server error', 500, null)
                        reject(apiResponse)

                    }

                })


            }

            let checkIntoMongoDb = (data) => {

                let input = data?.data

                return new Promise((resolve, reject) => {

                    try {

                        DeviceModel.aggregate(
                            [
                                {
                                  '$match': {
                                    'userId': {
                                      '$in': [
                                        'Qlu5NH9d2'
                                      ]
                                    }
                                  }
                                }, {
                                  '$lookup': {
                                    'from': 'devices', 
                                    'let': {
                                      'deviceId': '$deviceId'
                                    }, 
                                    'pipeline': [
                                      {
                                        '$match': {
                                          '$expr': {
                                            '$and': [
                                              {
                                                '$in': [
                                                  '$deviceId', data.devices.map(x => x["deviceId"] )
                                                ]
                                              }
                                            ]
                                          }
                                        }
                                      }
                                    ], 
                                    'as': 'devices'
                                  }
                                }
                              ]
                        )
                            .exec((err, result) => {

                                if (err) {

                                    logger.error(err.message, 'SocketIo : set-user : setUser : checkIntoMongoDb', 10, err)
                                    reject(response.generate(true, 'Failed to find device details', 500, null))


                                } else if (check.isEmpty(result)) {

                                    logger.info('No device found', 'SocketIo : set-user : setUser : checkIntoMongoDb', 1)
                                    reject(response.generate(true, 'No Device Found', 404, null))

                                } else {

                                    if (input.devices.length === result.length){
                                        

                                        let homes = {
                                            [data.homeId]: {
                                                [data.roomId]: data.homeId
                                            }
                                        }

                                        data.userHash = {
                                            "homes": JSON.parse(homes),
                                            "homeLimit": result.homeLimit,
                                            "connectedHome": 0,
                                            "roomLimit": result.roomLimit,
                                            "connectedRoom": 0,
                                            "requestPerDayLimit": result.requestPerDayLimit,
                                            "requestPerDay": 0,
                                            "connectedDeviceLimit": result.connectedDeviceLimit,
                                            "connectedDevice": 0,
                                            "userId":result.userId
                                        }

                                        resolve(response.generate(false, 'Device found', 200, result))
                                    }

                                    else reject(response.generate(true, 'Incorrect device Ids', 404, null))


                                }
                            })

                    } catch (err) {

                        logger.error('Internal server Error', 'SocketIo : set-user : setUser : checkIntoMongoDb', 10, err)
                        let apiResponse = response.generate(true, 'Internal server error', 500, null)
                        reject(apiResponse)

                    }

                })


            }

            let updateUserToRedis = (input) => {

                return new Promise((resolve, reject) => {

                    try {
                        
                        let data = input?.data

                        redis
                            .pipeline()
                            .hmset(userHashName, `${data.userId}.homes`, data.userHash.homes)
                            .hmset(userHashName, `${data.userId}.homeLimit`, data.userHash.homeLimit)
                            .hmset(userHashName, `${data.userId}.connectedHome`, data.userHash.connecteHome)
                            .hmset(userHashName, `${data.userId}.roomLimit`, data.userHash.roomLimit)
                            .hmset(userHashName, `${data.userId}.connectedRoom`, data.userHash.connectedRoom)
                            .hmset(userHashName, `${data.userId}.requestPerDayLimit`,data.userHash.requestPerDayLimit)
                            .hmset(userHashName, `${data.userId}.requestPerDay`, data.userHash.requestPerDay)
                            .hmset(userHashName, `${data.userId}.connectedDeviceLimit`,data.userHash.connectedDeviceLimit)
                            .hmset(userHashName, `${data.userId}.connectedDevice`,data.userHash.connectedDevice)
                            .hmset(userHashName, `${data.userId}.userId`,data.userHash.userId)
                            .exec((err, result) => {

                                if (err) {
                                    
                                   return reject(response.generate(true, 'Unable to update data into realtime database', 500, null))

                                } 

                                return resolve(response.generate(true, 'User details updated successfully to realtime database', 200, input))
                        
                            })

                    } catch (err) {

                        logger.error('Internal server Error', 'SocketIo : set-user : setUser : addUserAndDeviceToRedis', 10, err)
                        let apiResponse = response.generate(true, 'Internal server error', 500, null)
                        reject(apiResponse)

                    }

                })


            }

            verifyToken(data)
                .then(checkUserFromRedisAndValidate)
                .then((result) => {

                    if (result.status == 200) {
                        /*
                         TODO : Add device to SocketIO room
                        */
                        checkIntoMongoDb(result)
                        .then(addDeviceToRedis)
                        .then(updateUserToRedis)

                    } else {

                        /*
                         TODO : verify the home and device from mongoDB database
                        */
                       checkIntoMongoDb(data)
                       .then(addDeviceToRedis)
                       .then(updateUserToRedis)

                        

                    }

                })

        } catch (error) {

            logger.error('Internal server Error', 'socketLib : services : socketIo : setUser', 10, err)
            let apiResponse = response.generate(true, 'Internal server error', 500, null)
            reject(apiResponse)


        }


    })

}

// saving chats to database.
eventEmitter.on('save-device-state', (data) => {

    //findDevice and update
    deviceModel.findOne({ deviceId: data.deviceId, homeId: data.homeId, userId: data.userId }, (err, result) => {

        if (err) {
            console.log('Failed to find the device')

        } else if (check.isEmpty(result)) {
            console.log('No device found');

        } else {

            result.lastModified = time.now()
            result.state = data.state
            result.extra = (!check.isEmpty(data.extra) ? data.extra : result.extra)

            result.save(function (err, result) {
                if (err) {
                    console.log('Failed to edit the device state');
                } else {
                    console.log('Device state updated successfully');
                }
            })

        }

    })

}); // end of saving chat.



module.exports = {
    setUser: setUser
}// end exports