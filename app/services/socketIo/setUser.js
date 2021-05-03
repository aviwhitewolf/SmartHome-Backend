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
                            .hmget(userHashName, `${data.userId}.connectedRoomLimit`)
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
                                        "homeLimit": Number(result[1][1][0]),
                                        "connectedHome": Number(result[2][1][0]),
                                        "connectedRoomLimit": Number(result[3][1][0]),
                                        "connectedRoom": Number(result[4][1][0]),
                                        "requestPerDayLimit": Number(result[5][1][0]),
                                        "requestPerDay": Number(result[6][1][0]),
                                        "connectedDeviceLimit": Number(result[7][1][0]),
                                        "connectedDevice": Number(result[8][1][0]),
                                        "userId": result[9][1][0]
                                    }

                                    let connectedHome = data.userHash.connectedHome
                                    let homeLimit = data.userHash.homeLimit
                                    let connectedRoom = data.userHash.connectedRoom
                                    let connectedRoomLimit = data.userHash.connectedRoomLimit

                                    /*
                                    ? RequestPerDay check
                                    */
                                    if (data.userHash.requestPerDay >= data.userHash.requestPerDayLimit)
                                        return reject(response.generate(true, 'Today request quota is over, watch ad to get more request or update your plan', 400, data))


                                    /*
                                    ? If New Home, check homeLimit
                                    * Add New Home and Room, update home count and room count
                                    */
                                    if (data.userHash.homes[data.data.homeId] == undefined && (connectedHome + 1) < homeLimit) {

                                        data.userVerifiedFromRedis = true
                                        data.forward = true

                                        let homes = data.userHash.homes

                                        homes = {
                                            [data.homeId]: {
                                                [data.roomId]: connectedRoom + 1
                                            }
                                        }

                                        data.userHash.homes = JSON.stringify(homes)
                                        data.userHash.connecteHome = data.userHash.connecteHome + 1
                                        data.userHash.connectedRoom = connectedRoom + 1

                                        resolve(response.generate(true, 'Home and room added in redis', 200, data))


                                        /*
                                        ? Old Home and new room
                                        * Add new room to old home and update room count
                                        */
                                    } else if (data.userHash.homes[data.data.homeId][data.data.roomId] == undefined 
                                        && (connectedRoom) < connectedRoomLimit) {

                                        data.userVerifiedFromRedis = true
                                        data.forward = true

                                        let homes = data.userHash.homes

                                        homes[data.data.homeId][data.data.roomId] = connectedRoom + 1

                                        data.userHash.homes = JSON.stringify(homes)
                                        data.userHash.connectedRoom = connectedRoom + 1

                                        resolve(response.generate(true, 'Room added to redis', 200, data))

                                        /*
                                        ? If home and room both are present
                                        */
                                    } else if (data.userHash.homes[data.data.homeId] != undefined 
                                        && data.userHash.homes[data.data.homeId][data.data.roomId] != undefined) {

                                        data.userVerifiedFromRedis = true
                                        data.forward = true
                                        data.userHash.homes = JSON.stringify(data.userHash.homes)

                                        resolve(response.generate(true, 'Home and room already present', 200, data))

                                        /*
                                        ? Else part
                                        */
                                    } else {

                                        reject(response.generate(true, 'Update your Plan, Home or room limit reached', 400, data))

                                    }

                                } else {
                                    data.forward = true
                                    resolve(response.generate(true, 'User record not present in realtime database ', 400, data))

                                }

                            });

                    } catch (err) {

                        logger.error('Internal server Error', 'SocketLib : checkAndSetDataToRedis', 10, err)
                        reject(response.generate(true, 'Internal server error', 500, null))

                    }


                })

            }

            let addDeviceToArray = (input) => {

                let data = input.data

                return new Promise((resolve, reject) => {

                    try {

                        if (Array.isArray(data.devices) && data.devices.length > 0) {


                            let deviceCountCheck = data.userHash.connectedDevice;
                            let arrayToInsert = []

                            /*
                            * Get devices data from redis, from hash - ConnectedDevices
                            ? homeId, roomId, userId, deviceId, state, voltage, extra
                            ! If Not then add the device to redis database
                            * If yes then just update softwareConnected or hardwareConneted = 'y' 
                            * and set socketId1 or socketId2
                            */

                            for (let index = 0; index < data.devices.length; index++) {
                                let device = data.devices[index];
                                let subArray = []

                                if (deviceCountCheck <= data.userHash.connectedDeviceLimit) {

                                    redis
                                        .hmget(deviceHashName, `${device.deviceId}.deviceId`,
                                            (err, deviceResult) => {

                                                if (!check.isEmpty(deviceResult[0])) {

                                                    let typeText = "", socketText = "";

                                                    typeText = (device.hasOwnProperty("software") ? "softwareConnected" : "harwardConnected")
                                                    socketText = (device.hasOwnProperty("software") ? "socketId1" : "socketId2")

                                                    subArray.push("hmset",deviceHashName, `${device.deviceId}.${typeText}`, 'y')
                                                    arrayToInsert.push(subArray)
                                                    subArray = []
                                                    subArray.push("hmset",deviceHashName, `${device.deviceId}.${socketText}`, data.socketId)
                                                    arrayToInsert.push(subArray)
                                                    subArray = []

                                                    if (index === data.devices.length - 1) {
                                                        data.arrayToInsert = arrayToInsert
                                                        data.userHash.connectedDevice = deviceCountCheck
                                                         return resolve(response.generate(true, 'Device Added', 200, data))
                                                    }

                                                } else {

                                                    let typeText = "", socketText = "";

                                                    typeText = (device.hasOwnProperty("software") ? "softwareConnected" : "harwardConnected")
                                                    socketText = (device.hasOwnProperty("software") ? "socketId1" : "socketId2")

                                                    subArray.push("hmset",deviceHashName, `${device.deviceId}.homeId`, device.homeId)
                                                    arrayToInsert.push(subArray)
                                                    subArray = []


                                                    subArray.push("hmset",deviceHashName, `${device.deviceId}.roomId`, device.roomId)
                                                    arrayToInsert.push(subArray)
                                                    subArray = []


                                                    subArray.push("hmset",deviceHashName, `${device.deviceId}.userId`, device.userId)
                                                    arrayToInsert.push(subArray)
                                                    subArray = []


                                                    subArray.push("hmset",deviceHashName, `${device.deviceId}.deviceId`, device.deviceId)
                                                    arrayToInsert.push(subArray)
                                                    subArray = []

                                                    subArray.push("hmset",deviceHashName, `${device.deviceId}.state`, device.state)
                                                    arrayToInsert.push(subArray)
                                                    subArray = []

                                                    subArray.push("hmset",deviceHashName, `${device.deviceId}.voltage`, device.voltage)
                                                    arrayToInsert.push(subArray)
                                                    subArray = []


                                                    subArray.push("hmset",deviceHashName, `${device.deviceId}.extra`, device.extra)
                                                    arrayToInsert.push(subArray)
                                                    subArray = []


                                                    subArray.push("hmset",deviceHashName, `${device.deviceId}.${typeText}`, 'y')
                                                    arrayToInsert.push(subArray)
                                                    subArray = []

                                                    subArray.push("hmset",deviceHashName, `${device.deviceId}.${socketText}`, data.socketId)
                                                    arrayToInsert.push(subArray)
                                                    subArray = []

                                                    if (index === data.devices.length - 1) {
                                                        data.arrayToInsert = arrayToInsert
                                                        data.userHash.connectedDevice = deviceCountCheck
                                                       return resolve(response.generate(true, 'Device Added', 200, data))
                                                    }

                                                }

                                            });

                                } else {

                                    if (index === data.devices.length - 1) {
                                        data.arrayToInsert = arrayToInsert
                                        data.userHash.connectedDevice = deviceCountCheck
                                        return resolve(response.generate(true, 'Device Added', 200, data))

                                        // return reject(response.generate(true, 'Device Added, Max Device Limit reached', 400, null))
                                    }
                                }

                                deviceCountCheck++
                            }

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

                let input = data.data
                input.userId = data.userId
                input.socketId = data.socketId
                input.userHash = data.userHash

                return new Promise((resolve, reject) => {

                    try {

                        DailyUserPlanModel.aggregate(
                            [
                                {
                                    '$match': {
                                        'userId': {
                                            '$in': [
                                                data.userId
                                            ]
                                        }
                                    }
                                }, {
                                    '$lookup': {
                                        'from': 'devices',
                                        'let': {
                                            'deviceId': '$deviceId',
                                            'roomId': '$roomId'
                                        },
                                        'pipeline': [
                                            {
                                                '$match': {
                                                    '$expr': {
                                                        '$and': [
                                                            {
                                                                '$in': [
                                                                    '$deviceId', '$deviceId', input.devices.map(x => x["deviceId"])
                                                                ],
                                                                '$in': [
                                                                    '$roomId', [
                                                                        input.roomId
                                                                    ]
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
                            .exec((err, res) => {

                                if (err) {

                                    logger.error(err.message, 'SocketIo : set-user : setUser : checkIntoMongoDb', 10, err)
                                    reject(response.generate(true, 'Failed to find device details', 500, null))


                                } else if (check.isEmpty(res)) {

                                    logger.info('No device found', 'SocketIo : set-user : setUser : checkIntoMongoDb', 1)
                                    reject(response.generate(true, 'No Device Found', 404, null))

                                } else {

                                    let result = res[0]

                                    if (input.devices.length === result.devices.length) {


                                        let homes = {
                                            [input.homeId]: {
                                                [input.roomId]: result.roomLimit + 1
                                            }
                                        }
                                        input.devices = result.devices

                                        if (input.userHash == undefined || input.userHash == null || input.userHash == "")
                                            input.userHash = {
                                                "homes": JSON.stringify(homes),
                                                "homeLimit": result.homeLimit,
                                                "connectedHome": 1,
                                                "connectedRoomLimit": result.roomLimit,
                                                "connectedRoom": 1,
                                                "requestPerDayLimit": result.requestPerDayLimit,
                                                "requestPerDay": 0,
                                                "connectedDeviceLimit": result.connectedDeviceLimit,
                                                "connectedDevice": 0,
                                                "userId": result.userId
                                            }

                                        resolve(response.generate(false, 'Device found', 200, input))
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

                        let data = input.data
                        let subArray = []

                        subArray.push("hmset",userHashName, `${data.userId}.homes`, data.userHash.homes)
                        data.arrayToInsert.push(subArray)
                        subArray = []

                        subArray.push("hmset",userHashName, `${data.userId}.homeLimit`, data.userHash.homeLimit)
                        data.arrayToInsert.push(subArray)
                        subArray = []


                        subArray.push("hmset",userHashName, `${data.userId}.connectedHome`, data.userHash.connectedHome)
                        data.arrayToInsert.push(subArray)
                        subArray = []


                        subArray.push("hmset",userHashName, `${data.userId}.connectedRoomLimit`, data.userHash.connectedRoomLimit)
                        data.arrayToInsert.push(subArray)
                        subArray = []


                        subArray.push("hmset",userHashName, `${data.userId}.connectedRoom`, data.userHash.connectedRoom)
                        data.arrayToInsert.push(subArray)
                        subArray = []


                        subArray.push("hmset",userHashName, `${data.userId}.requestPerDayLimit`, data.userHash.requestPerDayLimit)
                        data.arrayToInsert.push(subArray)
                        subArray = []


                        subArray.push("hmset",userHashName, `${data.userId}.requestPerDay`, data.userHash.requestPerDay)
                        data.arrayToInsert.push(subArray)
                        subArray = []


                        subArray.push("hmset",userHashName, `${data.userId}.connectedDeviceLimit`, data.userHash.connectedDeviceLimit)
                        data.arrayToInsert.push(subArray)
                        subArray = []


                        subArray.push("hmset",userHashName, `${data.userId}.connectedDevice`, data.userHash.connectedDevice)
                        data.arrayToInsert.push(subArray)
                        subArray = []

                        subArray.push("hmset",userHashName, `${data.userId}.userId`, data.userHash.userId)
                        data.arrayToInsert.push(subArray)
                        subArray = []

                        redis
                            .pipeline(
                                data.arrayToInsert
                            )
                            .exec((err, result) => {

                                if (err) {

                                    return reject(response.generate(true, 'Unable to update data into realtime database', 500, null))

                                }

                                return resolve(response.generate(true, 'User details updated successfully to realtime database', 200, data))

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

                    if (result.status == 200 && result.data.forward) {
                        /*
                         TODO : Add device to SocketIO room
                        */
                        checkIntoMongoDb(result.data)
                            .then(addDeviceToArray)
                            .then(updateUserToRedis)

                    } else if (result.data.forward) {

                        /*
                         TODO : verify the home and device from mongoDB database
                        */
                        checkIntoMongoDb(result.data)
                            .then(addDeviceToArray)
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

// // saving chats to database.
// eventEmitter.on('save-device-state', (data) => {

//     //findDevice and update
//     deviceModel.findOne({ deviceId: data.deviceId, homeId: data.homeId, userId: data.userId }, (err, result) => {

//         if (err) {
//             console.log('Failed to find the device')

//         } else if (check.isEmpty(result)) {
//             console.log('No device found');

//         } else {

//             result.lastModified = time.now()
//             result.state = data.state
//             result.extra = (!check.isEmpty(data.extra) ? data.extra : result.extra)

//             result.save(function (err, result) {
//                 if (err) {
//                     console.log('Failed to edit the device state');
//                 } else {
//                     console.log('Device state updated successfully');
//                 }
//             })

//         }

//     })

// }); // end of saving chat.



module.exports = {
    setUser: setUsers
}// end exports