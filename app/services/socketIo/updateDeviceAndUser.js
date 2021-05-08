const mongoose = require('mongoose');
const logger = require('../../libs/loggerLib.js');
const time = require('../../libs/timeLib');
const config = require('../../config/config')
const tokenLib = require("../../libs/tokenLib.js");
const check = require("../../libs/checkLib.js");
const response = require('../../libs/responseLib');

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

                            } else if (!check.isEmpty(result)) {

                                
                                let mData = result.split('|')
                                data.deviceId = mData[0]
                                data.deviceType = mData[1]
                                data.userId = mData[2]
                                return resolve(data)

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

            let updateDeviceToRedis = (data) => {

                return new Promise((resolve, reject) => {

                    try {

                        
                        let arrayToUpdate = []

                        arrayToUpdate.push(
                            ["hmset",deviceHashName, `${data.deviceId}.${data.deviceType}`, 'n'],
                            ["hdel", deviceHashName,  data.socketId],
                            ["hincrby", userHashName, `${data.userId}.connectedDevice`, -1],
                            ["hget",deviceHashName, `${data.deviceId}.roomId`]
                        )

                        redis        
                        .pipeline(
                                arrayToUpdate
                            )
                            .exec((err, result) => {

                            if (err) {

                                return reject(response.generate(true, 'Unable to update data to realtime database', 500, null))

                            } else if (!check.isEmpty(result[3][1])) {

                                //returning roomId to disconnect device from socketRoom 
                                data.room = result[3][1]
                                return resolve(data)

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
