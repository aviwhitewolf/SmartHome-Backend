const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib')
const redisLib = require('../../libs/redisLib');

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

                let hashName = req.body.hashName;

                redisLib.getAllDataFromHash(hashName,
                    (err, result) => {

                        if (err) {

                            logger.error('Internal server Error', 'Redis Controller :  getAllRedisEnteries', 10, err)
                            let apiResponse = response.generate(true, 'Internal server error', 500, null)
                            reject(apiResponse)

                        } else if (check.isEmpty(result)) {

                            logger.error('List is Empty', 'Redis Controller :  getAllRedisEnteries', 5, err)
                            let apiResponse = response.generate(true, 'List is Empty', 404, null)
                            reject(apiResponse)

                        } else {

                            let jsonData;

                            if (typeof result === 'object') {

                                jsonData = result

                            } else if (typeof result === 'string') {

                                jsonData = JSON.parse(result)

                            } else {

                                jsonData = null

                            }

                            resolve(jsonData)

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
        .then((resolve) => {

            let apiResponse = response.generate(false, 'Success', 200, resolve);
            res.status(apiResponse.status).send(apiResponse)

        })
        .catch((err) => {
            res.status(err.status).send(err);
        })


}

module.exports = {
    allEnteries: getAllRedisEnteriesFunction
}// end exports