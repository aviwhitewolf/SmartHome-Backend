const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib')
const redisLib = require('../../libs/redisLib');

const Redis = require("ioredis");
const redis = new Redis();


let getAllRedisEnteriesFunction = (req, res) => {

    //check if person is authorised to add admin, proper rights
    let checkAuthorization = () => {

        return new Promise((resolve, reject) => {

            try {

                if (req.hasOwnProperty('result') && req.result.level <= 2) {

                    resolve()

                } else {

                    logger.error("Can't get redis Enteries. Admin don't have proper rights",
                        'Redis Controller :  editRedisEnteriesFunction : checkAuthorization', 1)
                    let apiResponse = response.generate(true, "Admin don't have proper rights", 403, null)
                    reject(apiResponse)

                }

            } catch (err) {


                logger.error('Internal server Error',
                    'Redis Controller :  editRedisEnteriesFunction : checkAuthorization', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)


            }

        })

    }


    let getAllRedisEnteries = () => {

        return new Promise((resolve, reject) => {

            try {


                let arrayToDisplay = []
                let inputArray = req.body

                inputArray.forEach((element, index) => {

                    arrayToDisplay.push(
                        ["hscan", element.hashName, 0, "MATCH", `${element.key}.*`]
                    )

                    if (index == inputArray.length - 1) {


                        redis.pipeline(
                            arrayToDisplay
                        ).exec((err, result) => {

                            if (err) {

                                logger.error('Internal server Error', 'Redis Controller :  getAllRedisEnteries', 10, err)
                                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                                reject(apiResponse)

                            } else {

                                resolve(response.generate(false, 'Success', 200, result))

                            }

                        });


                    }

                });

            } catch (err) {

                logger.error('Internal server Error', 'Redis Controller :  getAllRedisEnteries', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }

    checkAuthorization(req, res)
        .then(getAllRedisEnteries)
        .then((result) => {

            res.status(result.status).send(result)

        })
        .catch((err) => {
            res.status(err.status).send(err);
        })


}

module.exports = {
    allEnteries: getAllRedisEnteriesFunction
}// end exports