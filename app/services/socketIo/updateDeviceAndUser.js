const mongoose = require('mongoose');
const logger = require('../../libs/loggerLib.js');
const time = require('../../libs/timeLib');
const config = require('../../config/config')
const tokenLib = require("../../libs/tokenLib.js");
const check = require("../../libs/checkLib.js");
const response = require('../../libs/responseLib');
const redisLib = require('../../libs/redisLib');
// const eventEmitter = new events.EventEmitter();

const Redis = require("ioredis");
const redis = new Redis();

/*

* For Highlighted text
! For Errors
? Answers and questions

*/

const deviceHashName = config.constants.ConnectedDevice;
const userHashName = config.constants.ConnectedUser;

let updateDeviceAndUserRedis = (data) => {

    return new Promise((resolve, reject) => {

        try {

            let findDeviceFromRedis = (data) => {

                return new Promise((resolve, reject) => {

                    try {

                        redis.hget(deviceHashName, `${data.socketId}`, (err, result) => {

                            if (err) {

                                return reject(response.generate(true, 'Unable to find device from realtime database', 500, null))

                            } else if (!check.isEmpty(result[0][0][0])) {

                                
                                let mData = result[0][0][0].split('|')
                                data.deviceId = mData[0]
                                data.deviceType = mData[1]
                                return resolve(response.generate(true, 'Device details found successfully from realtime database', 200, data))

                            } else {

                                return reject(response.generate(true, 'Unable to find data from realtime database', 500, null))

                            }
                        })  
   
                    } catch (err) {

                        logger.error('Internal server Error', 'SocketIo : disconnect : updateDeviceAndUserRedis : findDeviceFromRedis()', 10, err)
                        let apiResponse = response.generate(true, 'Internal server error', 500, null)
                        reject(apiResponse)

                    }

                })

            }

            let updateDeviceToRedis = (input) => {

                let data = input.data
                return new Promise((resolve, reject) => {

                    try {

                        let typeText = "";
                        let arrayToUpdate = []

                        typeText = (data.deviceType.hasOwnProperty("software") ? "softwareConnected" : "harwardConnected")

                        arrayToUpdate.push(
                            ["hmset",deviceHashName, `${data.deviceId}.${typeText}`, 'n'],
                            ["hdel", deviceHashName,  data.socketId],
                            ["hincrby", userHashName, `${data.userId.connectedDevice}`, -1]
                            ["hget",deviceHashName, `${data.deviceId}.roomId`],
                        )

                        redis        
                        .pipeline(
                                arrayToUpdate
                            )
                            .exec((err, result) => {

                            if (err) {

                                return reject(response.generate(true, 'Unable to update data to realtime database', 500, null))

                            } else if (!check.isEmpty(result[0][3][0])) {

                                //returning roomId to disconnect device from socketRoom 
                                data.room = result[0][3][0]
                                return resolve(response.generate(true, 'Device details and User updated successfully to realtime database', 200, data))

                            } else {

                                return reject(response.generate(true, 'Unable to update data to realtime database', 500, null))

                            }
                        })
                        
                    } catch (err) {

                        logger.error('Internal server Error', 'SocketIo : disconnect : updateDeviceAndUserRedis : findDeviceFromRedis()', 10, err)
                        let apiResponse = response.generate(true, 'Internal server error', 500, null)
                        reject(apiResponse)

                    }

                })

            }


            findDeviceFromRedis(data)
            .then(updateDeviceToRedis)
            .then((result) => {

                resolve(result)    

            })
            .catch((err) => {
                reject(err)
            })

        } catch (error) {

            logger.error('Internal server Error', 'socketLib : services : socketIo : updateDeviceAndUserRedis', 10, err)
            let apiResponse = response.generate(true, 'Internal server error', 500, null)
            reject(apiResponse)

        }

    })

}


module.exports = {
    updateDeviceAndUserRedis : updateDeviceAndUserRedis
}





































// let deleteUserFromRedis = (input) => {

//     return new Promise((resolve, reject) => {

//         try {

//             let data = input.data
//             let arrayToDelete = []

//             if (data.deleteDeviceFromRedis) {

//                 arrayToDelete.push(
//                     ["hdel", userHashName, `${data.userId}.homes`],
//                     ["hdel", userHashName, `${data.userId}.homeLimit`],
//                     ["hdel", userHashName, `${data.userId}.connectedHome`],
//                     ["hdel", userHashName, `${data.userId}.connectedRoomLimit`],
//                     ["hdel", userHashName, `${data.userId}.connectedRoom`],
//                     ["hdel", userHashName, `${data.userId}.requestPerDayLimit`],
//                     ["hdel", userHashName, `${data.userId}.requestPerDay`],
//                     ["hdel", userHashName, `${data.userId}.connectedDeviceLimit`],
//                     ["hdel", userHashName, `${data.userId}.connectedDevice`],
//                     ["hdel", userHashName, `${data.userId}.userId`]
                
//                 )

//                 redis
//                     .pipeline(data.arrayToDelete)
//                     .exec((err, result) => {

//                         if (err) {

//                             return reject(response.generate(true, 'Unable to delete user data from realtime database', 500, null))

//                         } else if (result[0][1][0]) {

//                             /*
//                             TODO : Emit a event to update user data to mongodb
//                             */
//                             return resolve(response.generate(true, 'User details deleted successfully from realtime database', 200, data))

//                         } else {

//                             return reject(response.generate(true, 'Unable to delete user data from realtime database', 500, null))

//                         }

//                     })

//             } else {

//                 return resolve(response.generate(true, 'Nothing to delete, still some device are connected', 200, data))

//             }

//         } catch (err) {

//             logger.error('Internal server Error', 'SocketIo : set-user : setUser : addUserAndDeviceToRedis', 10, err)
//             let apiResponse = response.generate(true, 'Internal server error', 500, null)
//             reject(apiResponse)

//         }

//     })

// }
// let deleteDeviceFromRedis = (input) => {

//     return new Promise((resolve, reject) => {

//         try {

//             let data = input.data
//             let arrayToDelete = []
//             data.deleteUserFromRedis = false

//             for (let index = 0; index < data.devices.length; index++) {

//                 let device = data.devices[index];

//                 let typeText = "", socketText = "";

//                 typeText = (device.hasOwnProperty("software") ? "softwareConnected" : "harwardConnected")
//                 socketText = (device.hasOwnProperty("software") ? "socketId1" : "socketId2")

//                 arrayToDelete.push(
//                     ["hdel", deviceHashName, `${device.deviceId}.homeId`],
//                     ["hdel", deviceHashName, `${device.deviceId}.roomId`],
//                     ["hdel", deviceHashName, `${device.deviceId}.userId`],
//                     ["hdel", deviceHashName, `${device.deviceId}.deviceId`],
//                     ["hdel", deviceHashName, `${device.deviceId}.state`],
//                     ["hdel", deviceHashName, `${device.deviceId}.voltage`],
//                     ["hdel", deviceHashName, `${device.deviceId}.extra`],
//                     ["hdel", deviceHashName, `${device.deviceId}.${typeText}`],
//                     ["hdel", deviceHashName, `${device.deviceId}.${socketText}`],
//                     ["hdel", deviceHashName, `${device.deviceId}.${socketText}`],
//                     ["hincrby", userHashName, `${data.userId.connectedDevice}`, -1]
                
//                 )

//                 if (index === data.devices.length - 1) {

//                     data.arrayToDelete = arrayToDelete

//                     redis
//                         .pipeline(
//                             data.arrayToDelete
//                         )
//                         .exec((err, result) => {

//                             if (err) {

//                                 return reject(response.generate(true, 'Unable to delete data drom realtime database', 500, null))

//                             } else if (!check.isEmpty(result[0][1][0])) {

//                                 if (result[0][10][0] <= 0) data.deleteDeviceFromRedis = true

//                                 return resolve(response.generate(true, 'Device details deleted successfully from realtime database', 200, data))

//                             } else {

//                                 return reject(response.generate(true, 'Unable to delete data drom realtime database', 500, null))

//                             }
//                         })
//                 }
//             }

//         } catch (err) {

//             logger.error('Internal server Error', 'SocketIo : set-user : setUser : addUserAndDeviceToRedis', 10, err)
//             let apiResponse = response.generate(true, 'Internal server error', 500, null)
//             reject(apiResponse)
//         }
//     })
// }