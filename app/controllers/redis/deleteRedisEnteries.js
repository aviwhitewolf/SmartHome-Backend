const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib')
const redisLib = require('../../libs/redisLib');

let deleteRedisEnteriesFunction = (req, res) => {

    //check if person is authorised to add admin, proper rights
    let checkAuthorization = () => {

        return new Promise((resolve, reject) => {

            try {

                if (req.hasOwnProperty('result') && req.result.level <= 1) {

                    resolve()

                } else {

                    logger.error("Plan can not be created. Admin don't have proper rights",
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

                let hashName, keys;
                hashName = req.body.hashName;
                keys = req.body.keys;

                redisLib.deleteFromHash(hashName, keys, (err, result) => {

                    if (err) {

                        logger.error('Unable to delete', 'Redis Controller :  deleteRedisEnteries', 10, err)
                        let apiResponse = response.generate(true, 'Internal server error', 500, null)
                        reject(apiResponse)

                    } else if (check.isEmpty(result)) {

                        logger.error('List is Empty', 'Redis Controller :  deleteRedisEnteries', 5, err)
                        let apiResponse = response.generate(true, 'List is Empty', 404, null)
                        reject(apiResponse)

                    } else {

                        if (result > 0) {

                            resolve()

                        } else {

                            logger.error('No entries found', 'Redis Controller :  deleteRedisEnteries', 5, err)
                            let apiResponse = response.generate(true, 'Unable to delete', 404, null)
                            reject(apiResponse)

                        }

                    }
                })

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
        .then((resolve) => {

            let apiResponse = response.generate(false, 'Entries deleted successfuly', 200, resolve);
            res.status(apiResponse.status).send(apiResponse)

        })
        .catch((err) => {
            res.status(err.status).send(err);
        })


}

module.exports = {
    deleteEnteries: deleteRedisEnteriesFunction
}// end exports