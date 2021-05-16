const mongoose = require('mongoose');
const logger = require('./../../libs/loggerLib.js');
const config = require('../../config/config')
const check = require("./../../libs/checkLib.js");
const response = require('./../../libs/responseLib');
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

            let checkUserFromRedisAndValidate = (data) => {

                data.userVerifiedFromRedis = false
                data.forward = false

                return new Promise((resolve, reject) => {

                    try {

                        /*
                        * Get User data from redis,from hash - ConnectedUser
                        ? homes, connectedHomeLimit, connectedhome, connectedRoomLimit, connectedRoom, requestPerDayLimit,
                        ? requestPerDay, connectedDeviceLimitLimit, connectedDevice, userId
                        ! If Not then follow the different process and add user to redis
                        * If yes then check for devices data from redis, from hash - ConnectedDevices 
                        */

                        redis
                            .pipeline()
                            .hmget(userHashName, `${data.userId}.homes`)
                            .hmget(userHashName, `${data.userId}.connectedHomeLimit`)
                            .hmget(userHashName, `${data.userId}.connectedHome`)
                            .hmget(userHashName, `${data.userId}.connectedRoomLimit`)
                            .hmget(userHashName, `${data.userId}.connectedRoom`)
                            .hmget(userHashName, `${data.userId}.requestPerDayLimit`)
                            .hmget(userHashName, `${data.userId}.requestPerDay`)
                            .hmget(userHashName, `${data.userId}.connectedDeviceLimit`)
                            .hmget(userHashName, `${data.userId}.connectedDevice`)
                            .hmget(userHashName, `${data.userId}.userId`)
                            .exec((err, result) => {


                                if(err){
                                    reject(response.generate(true, 'Some error occured while fetching user data from realtime database', 500, null))
                                }

                                // "homes",                result[0][1][0]
                                // "connectedHomeLimit",            result[1][1][0]
                                // "connectedHome",        result[2][1][0]
                                // "connectedRoomLimit",            result[3][1][0]
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
                                        "connectedHomeLimit": Number(result[1][1][0]),
                                        "connectedHome": Number(result[2][1][0]),
                                        "connectedRoomLimit": Number(result[3][1][0]),
                                        "connectedRoom": Number(result[4][1][0]),
                                        "requestPerDayLimit": Number(result[5][1][0]),
                                        "requestPerDay": Number(result[6][1][0]),
                                        "connectedDeviceLimit": Number(result[7][1][0]),
                                        "connectedDevice": Number(result[8][1][0]),
                                        "userId": result[9][1][0]
                                    }

                                    /*
                                    ? RequestPerDay check
                                    */
                                    if (data.userHash.requestPerDay >= data.userHash.requestPerDayLimit)
                                        return reject(response.generate(true, 'Today request quota is over, watch ad to get more request or update your plan', 400, null))

                                    /*
                                    If connected Device limit is reached
                                    */
                                    if (data.userHash.connectedDevice >= data.userHash.connectedDeviceLimit)
                                        return reject(response.generate(true, 'Can not add more device,try disconnecting some device from mobile app, website', 400, null))

                                    /*
                                    ? If New Home, check connectedHomeLimit
                                    * Add New Home and Room, update home count and room count
                                    */
                                    if (data.userHash.homes[data.homeId] == undefined 
                                        && (data.userHash.connectedHome + 1) < data.userHash.connectedHomeLimit) {

                                        data.userVerifiedFromRedis = true
                                        data.forward = true

                                        let homes = data.userHash.homes

                                        homes = {
                                            [data.homeId]: {
                                                [data.roomId]: data.userHash.connectedRoom + 1
                                            }
                                        }

                                        data.userHash.homes = JSON.stringify(homes)
                                        data.userHash.connecteHome = data.userHash.connecteHome + 1
                                        data.userHash.connectedRoom = data.userHash.connectedRoom + 1

                                        // resolve(response.generate(false, 'Home and room added in redis', 200, data))

                                        resolve(data)

                                        /*
                                        ? Old Home and new room
                                        * Add new room to old home and update room count
                                        */
                                    } else if (data.userHash.homes[data.homeId][data.roomId] == undefined
                                        && (data.userHash.connectedRoom) < data.userHash.connectedRoomLimit) {

                                        data.userVerifiedFromRedis = true
                                        data.forward = true

                                        let homes = data.userHash.homes

                                        homes[data.homeId][data.roomId] = data.userHash.connectedRoom + 1

                                        data.userHash.homes = JSON.stringify(homes)
                                        data.userHash.connectedRoom = data.userHash.connectedRoom + 1

                                        // resolve(response.generate(false, 'Room added to redis', 200, data))

                                        resolve(data)
                                        /*
                                        ? If home and room both are present
                                        */
                                    } else if (data.userHash.homes[data.homeId] != undefined
                                        && data.userHash.homes[data.homeId][data.roomId] != undefined) {

                                        data.userVerifiedFromRedis = true
                                        data.forward = true
                                        data.userHash.homes = JSON.stringify(data.userHash.homes)

                                        // resolve(response.generate(false, 'Home and room already present', 200, data))
                                        resolve(data)
                                        /*
                                        ? Else part
                                        */
                                    } else {

                                        reject(response.generate(true, 'Update your Plan, Home or room limit reached', 400, null))

                                    }

                                } else {
                                    data.forward = true
                                    // resolve(response.generate(false, 'User record not present in realtime database ', 400, data))
                                    resolve(data)
                                }

                            });

                    } catch (err) {

                        logger.error('Internal server Error', 'SocketLib : checkAndSetDataToRedis', 10, err)
                        reject(response.generate(true, 'Internal server error', 500, null))

                    }


                })

            }

            let checkIntoMongoDb = (data) => {

                return new Promise((resolve, reject) => {

                    try {

                        DailyUserPlanModel.aggregate(
                            [
                                { '$match': { 'userId': {'$in': [data.userId] } } },
                                 {
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
                                                                '$in': ['$roomId', [data.roomId]],
                                                                '$in': ['$deviceId', data.devices.map(x => x["deviceId"])]
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

                                    if (data.devices.length === result.devices.length) {


                                        let homes = {
                                            [data.homeId]: {
                                                [data.roomId]: result.connectedRoomLimit + 1
                                            }
                                        }
                                        data.devices = result.devices

                                        if ((data.userHash == undefined || data.userHash == null || data.userHash == "")
                                            && !data.userVerifiedFromRedis)
                                            data.userHash = {
                                                "homes": JSON.stringify(homes),
                                                "connectedHomeLimit": result.connectedHomeLimit,
                                                "connectedHome": 1,
                                                "connectedRoomLimit": result.connectedRoomLimit,
                                                "connectedRoom": 1,
                                                "requestPerDayLimit": result.requestPerDayLimit,
                                                "requestPerDay": 0,
                                                "connectedDeviceLimit": result.connectedDeviceLimit,
                                                "connectedDevice": 0,
                                                "userId": result.userId
                                            }

                                        // resolve(response.generate(false, 'Device found', 200, input))
                                        resolve(data)
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

            let addDeviceToArray = (data) => {

                return new Promise((resolve, reject) => {

                    try {


                        if (Array.isArray(data.devices) && data.devices.length > 0) {


                            let deviceCountCheck = data.userHash.connectedDevice;
                            let arrayToInsert = [], socketInfo = []

                            /*
                            * Get devices data from redis, from hash - ConnectedDevices
                            ? homeId, roomId, userId, deviceId, state, voltage, extra
                            ! If Not then add the device to redis database
                            * If yes then just increment softwareConnected or hardwareConneted by 1
                            * and set socketIdS or socketIdH
                            */

                            for (let index = 0; index < data.devices.length; index++) {
                                let device = data.devices[index];

                                if (deviceCountCheck <= data.userHash.connectedDeviceLimit) {

                                    redis.pipeline([
                                        ["hmget", deviceHashName, `${device.deviceId}.deviceId`],
                                        ["hmget", deviceHashName, `${device.deviceId}.softwareConnected`],
                                        ["hmget", deviceHashName, `${device.deviceId}.harwardConnected`]
                                    ]
                                    ).exec((err, result) => {


                                        let typeText = "";

                                        typeText = (data['type'] == 's' ? "softwareConnected" : "harwardConnected")

                                        if (!check.isEmpty(result[2][1][0]) && result[2][1][0] < 0)
                                            arrayToInsert.push(
                                                ["hmset", deviceHashName, `${device.deviceId}.softwareConnected`, 0],
                                            )

                                        if (!check.isEmpty(result[2][1][0]) && result[2][1][0] < 0)
                                            arrayToInsert.push(
                                                ["hmset", deviceHashName, `${device.deviceId}.hardwareConnected`, 0],
                                            )


                                        socketInfo.push({
                                            'deviceId': device.deviceId,
                                            'deviceType': typeText,
                                            'userId': device.userId
                                        })


                                        if (!check.isEmpty(result[0][1][0])) {

                                            arrayToInsert.push(
                                                ["hincrby", deviceHashName, `${device.deviceId}.${typeText}`, 1],
                                                ["hmset", deviceHashName, `${device.deviceId}.socketId`, data.socketId]
                                            )


                                        } else {

                                            arrayToInsert.push(
                                                ["hmset", deviceHashName, `${device.deviceId}.homeId`, device.homeId],
                                                ["hmset", deviceHashName, `${device.deviceId}.roomId`, device.roomId],
                                                ["hmset", deviceHashName, `${device.deviceId}.userId`, device.userId],
                                                ["hmset", deviceHashName, `${device.deviceId}.deviceId`, device.deviceId],
                                                ["hmset", deviceHashName, `${device.deviceId}.state`, device.state],
                                                ["hmset", deviceHashName, `${device.deviceId}.voltage`, device.voltage],
                                                ["hmset", deviceHashName, `${device.deviceId}.extra`, device.extra],
                                                ["hmset", deviceHashName, `${device.deviceId}.value`, device.value || ""],
                                                ["hincrby", deviceHashName, `${device.deviceId}.${typeText}`, 1],
                                                ["hmset", deviceHashName, `${device.deviceId}.socketId`, data.socketId]
                                            )

                                        }


                                        if (index === data.devices.length - 1) {
                                            arrayToInsert.push(["hmset", deviceHashName, `${data.socketId}`, JSON.stringify(socketInfo)])
                                            data.arrayToInsert = arrayToInsert
                                            data.userHash.connectedDevice = deviceCountCheck
                                            return resolve(data)
                                        }

                                    });

                                } else {

                                    if (index === data.devices.length - 1) {
                                        data.arrayToInsert = arrayToInsert
                                        data.userHash.connectedDevice = deviceCountCheck
                                        // return resolve(response.generate(false, 'Device Added', 200, data))
                                        return resolve(data)

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

            let updateUserToRedis = (data) => {

                return new Promise((resolve, reject) => {

                    try {


                        data.arrayToInsert.push(

                            ["hmset", userHashName, `${data.userId}.homes`, data.userHash.homes],
                            ["hmset", userHashName, `${data.userId}.connectedHomeLimit`, data.userHash.connectedHomeLimit],
                            ["hmset", userHashName, `${data.userId}.connectedHome`, data.userHash.connectedHome],
                            ["hmset", userHashName, `${data.userId}.connectedRoomLimit`, data.userHash.connectedRoomLimit],
                            ["hmset", userHashName, `${data.userId}.connectedRoom`, data.userHash.connectedRoom],
                            ["hmset", userHashName, `${data.userId}.requestPerDayLimit`, data.userHash.requestPerDayLimit],
                            ["hmset", userHashName, `${data.userId}.requestPerDay`, data.userHash.requestPerDay],
                            ["hmset", userHashName, `${data.userId}.connectedDeviceLimit`, data.userHash.connectedDeviceLimit],
                            ["hmset", userHashName, `${data.userId}.connectedDevice`, data.userHash.connectedDevice],
                            ["hmset", userHashName, `${data.userId}.userId`, data.userHash.userId]
                        )

                        redis
                            .pipeline(
                                data.arrayToInsert
                            )
                            .exec((err, result) => {

                                if (err) {

                                    return reject(response.generate(true, 'Unable to update data into realtime database', 500, null))

                                }

                                // return resolve(response.generate(false, 'User details updated successfully to realtime database', 200, data))
                                return resolve(data)
                            })

                    } catch (err) {

                        logger.error('Internal server Error', 'SocketIo : set-user : setUser : addUserAndDeviceToRedis', 10, err)
                        let apiResponse = response.generate(true, 'Internal server error', 500, null)
                        reject(apiResponse)

                    }

                })


            }

            let deleteAllRedisEnteries = (data) => {

                return new Promise((resolve, reject) => {

                    try {


                        let arrayToDelete = []

                        if ((data.userHash == undefined || data.userHash == null || data.userHash == "")
                            && !data.userVerifiedFromRedis) {

                            arrayToDelete.push(
                                ["hdel", element.hashName, `${element.key}.homes`],
                                ["hdel", element.hashName, `${element.key}.connectedHomeLimit`],
                                ["hdel", element.hashName, `${element.key}.connectedHome`],
                                ["hdel", element.hashName, `${element.key}.connectedRoomLimit`],
                                ["hdel", element.hashName, `${element.key}.connectedRoom`],
                                ["hdel", element.hashName, `${element.key}.requestPerDayLimit`],
                                ["hdel", element.hashName, `${element.key}.requestPerDay`],
                                ["hdel", element.hashName, `${element.key}.connectedDeviceLimit`],
                                ["hdel", element.hashName, `${element.key}.connectedDevice`],
                                ["hdel", element.hashName, `${element.key}.userId`]
                            )


                            data.devices.forEach((element, index) => {

                                arrayToDelete.push(
                                    ["hdel", element.hashName, `${element.key}.homeId`],
                                    ["hdel", element.hashName, `${element.key}.roomId`],
                                    ["hdel", element.hashName, `${element.key}.userId`],
                                    ["hdel", element.hashName, `${element.key}.deviceId`],
                                    ["hdel", element.hashName, `${element.key}.state`],
                                    ["hdel", element.hashName, `${element.key}.voltage`],
                                    ["hdel", element.hashName, `${element.key}.extra`],
                                    ["hdel", element.hashName, `${element.key}.value`]
                                    ["hdel", element.hashName, `${element.key}.harwardConnected`],
                                    ["hdel", element.hashName, `${element.key}.softwareConnected`]
                                )

                                if (index == data.devices.length - 1) {

                                    redis.pipeline(
                                        arrayToDelete
                                    ).exec((err, result) => {

                                        if (err) {

                                            logger.error('Unable to delete', 'Redis Controller :  deleteRedisEnteries', 10, err)
                                            reject(response.generate(true, 'Internal server error', 500, null))

                                        } else {

                                            resolve(response.generate(false, 'Data deleted Successfully', 200, data))

                                        }
                                    })

                                }

                            });
                        } else {
                            resolve(response.generate(false, 'Nothing to delete', 200, data))
                        }

                    } catch (err) {

                        logger.error('Internal server Error',
                            'Redis Controller : deleteRedisEnteriesFunction : deleteRedisEnteries', 10, err)
                        let apiResponse = response.generate(true, 'Internal server error', 500, null)
                        reject(apiResponse)

                    }

                })

            }

            checkUserFromRedisAndValidate(data)
                .then((result) => {

                    // if (result.status == 200 && result.data.forward) {
                    /*
                     TODO : Add device to SocketIO room
                    */
                    checkIntoMongoDb(result)
                        .then(addDeviceToArray)
                        .then(updateUserToRedis)
                        .then((result) => {
                            resolve(result)
                        }).catch((err) => {
                            reject(err)
                        })

                    // } else{

                    // }

                }).catch((err) => {
                    reject(err)
                })

        } catch (error) {

            logger.error('Internal server Error', 'socketLib : services : socketIo : setUser', 10, err)
            let apiResponse = response.generate(true, 'Internal server error', 500, null)
            reject(apiResponse)


        }


    })

}




module.exports = {
    setUser: setUsers
}// end exports