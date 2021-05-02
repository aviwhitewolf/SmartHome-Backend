const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');

let editRedisEnteriesFunction = (req, res) => {

    //check if person is authorised to add admin, proper rights
    let checkAuthorization = () => {

        return new Promise((resolve, reject) => {

            try {

                if (req.hasOwnProperty('result') && req.result.level <= 1) {

                    resolve()

                } else {

                    logger.error("Plan can not be created. Admin don't have proper rights", 'planController: checkAuthorization', 1)
                    let apiResponse = response.generate(true, "Admin don't have proper rights", 403, null)
                    reject(apiResponse)

                }

            } catch (err) {


                logger.error('Internal server Error', 'planController: checkAuthorization', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)


            }

        })

    }

    let editRedisEnteries = () => {

        return new Promise((resolve, reject) => {

            try {

            } catch (err) {

                logger.error('Internal server Error', 'Redis Controller :  editRedisEnteriesFunction :  editRedisEnteries', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }

    checkAuthorization(req, res)
        .then(editRedisEnteries)
        .then((resolve) => {

            let apiResponse = response.generate(false, 'Entries updated successfuly', 200, resolve);
            res.status(apiResponse.status).send(apiResponse)

        })
        .catch((err) => {
            res.status(err.status).send(err);
        })


}

module.exports = {
    editEntries    : editRedisEnteriesFunction
}// end exports