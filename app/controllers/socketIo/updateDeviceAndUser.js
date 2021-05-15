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

                                data.info = JSON.parse(result)
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

                        data.info.forEach((element, index) => {

                            arrayToUpdate.push(
                                ["hincrby", deviceHashName, `${element.deviceId}.${element.deviceType}`, -1],
                                ["hdel", deviceHashName, data.socketId],
                                ["hincrby", userHashName, `${element.userId}.connectedDevice`, -1],
                                ["hget", deviceHashName, `${element.deviceId}.roomId`],
                                ["hdel", deviceHashName, `${element.deviceId}.socketId`]
                            )

                            if (index == data.info.length - 1) {

                                redis
                                    .pipeline(arrayToUpdate)
                                    .exec((err, result) => {

                                        if (err) {

                                            return reject(response.generate(true, 'Unable to update data to realtime database', 500, null))

                                        } else if (!check.isEmpty(result[3][1])) {

                                            console.log("Device Disconnected for :"+ data.socketId)
                                            //returning roomId to disconnect device from socketRoom 
                                            data.roomId = result[3][1]
                                            return resolve(data)

                                        } else {

                                            return reject(response.generate(true, 'Unable to update data to realtime database', 500, null))

                                        }
                                    })

                            }

                        });


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
    updateDeviceAndUserRedis: updateDeviceAndUserRedis
}
