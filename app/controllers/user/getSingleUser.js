const mongoose = require('mongoose');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib')

/* Models */
const UserModel = mongoose.model('User')

/* Get single user details */
let getSingleUser = (req, res) => {

    try {


        UserModel.findOne({ 'userId': req.user.userId })
            .select('-password -__v -_id -userId')
            .lean()
            .exec((err, result) => {

                if (err) {

                    logger.error(err.message, 'User Controller: getSingleUser', 10, err)
                    let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                    res.status(apiResponse.status).send(apiResponse)

                } else if (check.isEmpty(result)) {

                    logger.info('No User Found', 'User Controller:getSingleUser', 2)
                    let apiResponse = response.generate(true, 'No User Found', 404, null)
                    res.status(apiResponse.status).send(apiResponse)

                } else {

                    let apiResponse = response.generate(false, 'User Details Found', 200, result)
                    res.status(apiResponse.status).send(apiResponse)

                }
            })


    } catch (err) {

        logger.error('Internal server Error', 'User Controller: getSingleUser', 10, err)
        let apiResponse = response.generate(true, 'Internal server error', 500, null)
        res.status(apiResponse.status).send(apiResponse)


    }

}// end get single user

module.exports = {
    getSingleUser: getSingleUser
}// end exports