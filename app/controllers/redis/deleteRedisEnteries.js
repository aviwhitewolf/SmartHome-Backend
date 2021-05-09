const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib')
const redisLib = require('../../libs/redisLib');


const Redis = require("ioredis");
const redis = new Redis();

let deleteRedisEnteriesFunction = (req, res) => {

    //check if person is authorised to add admin, proper rights
    let checkAuthorization = () => {

        return new Promise((resolve, reject) => {

            try {

                if (req.hasOwnProperty('result') && req.result.level <= 1) {

                    resolve()

                } else {

                    logger.error("Admin don't have proper rights",
                        'Redis Controller : deleteRedisEnteriesFunction : checkAuthorization', 1)
                    let apiResponse = response.generate(true, "Admin don't have proper rights", 403, null)
                    reject(apiResponse)

                }

            } catch (err) {


                logger.error('Internal server Error',
                    'Redis Controller : deleteRedisEnteriesFunction : checkAuthorization', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)


            }

        })

    }


    let deleteRedisEnteries = () => {

        return new Promise((resolve, reject) => {

            try {


                let arrayToDelete = []
                let inputArray = req.body || []

                inputArray.forEach((element, index) => {

                    if (element.type == "user"){
                        arrayToDelete.push(
                            ["hdel", element.hashName, `${element.key}.homes`],
                            ["hdel", element.hashName, `${element.key}.homeLimit`],
                            ["hdel", element.hashName, `${element.key}.connectedHome`],
                            ["hdel", element.hashName, `${element.key}.connectedRoomLimit`],
                            ["hdel", element.hashName, `${element.key}.connectedRoom`],
                            ["hdel", element.hashName, `${element.key}.requestPerDayLimit`],
                            ["hdel", element.hashName, `${element.key}.requestPerDay`],
                            ["hdel", element.hashName, `${element.key}.connectedDeviceLimit`],
                            ["hdel", element.hashName, `${element.key}.connectedDevice`],
                            ["hdel", element.hashName, `${element.key}.userId`]
                        )
                    }
                    else if (element.type == "device"){
                        arrayToDelete.push(
                            ["hdel", element.hashName, `${element.key}.homeId`],
                            ["hdel", element.hashName, `${element.key}.roomId`],
                            ["hdel", element.hashName, `${element.key}.userId`],
                            ["hdel", element.hashName, `${element.key}.deviceId`],
                            ["hdel", element.hashName, `${element.key}.state`],
                            ["hdel", element.hashName, `${element.key}.voltage`],
                            ["hdel", element.hashName, `${element.key}.extra`],
                            ["hdel", element.hashName, `${element.key}.harwardConnected`],
                            ["hdel", element.hashName, `${element.key}.softwareConnected`],
                            ["hdel", element.hashName, `${element.key}.socketId`]
                        )
                        }
                    if (index == inputArray.length - 1) {


                        redis.pipeline(
                            arrayToDelete
                        ).exec((err, result) => {

                            if (err) {

                                logger.error('Unable to delete', 'Redis Controller :  deleteRedisEnteries', 10, err)
                                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                                reject(apiResponse)

                            } else {

                                let apiResponse = response.generate(true, 'Data deleted Successfully', 200, result)
                                resolve(apiResponse)

                            }
                        })

                    }

                });

            } catch (err) {

                logger.error('Internal server Error',
                    'Redis Controller : deleteRedisEnteriesFunction : deleteRedisEnteries', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }

    checkAuthorization(req, res)
        .then(deleteRedisEnteries)
        .then((result) => {

            res.status(result.status).send(result)

        })
        .catch((err) => {
            res.status(err.status).send(err);
        })


}

module.exports = {
    deleteEnteries: deleteRedisEnteriesFunction
}// end exports