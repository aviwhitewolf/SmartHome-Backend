const mongoose = require('mongoose');
const time = require('./../../libs/timeLib');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib')

/* Models */
const UserModel = mongoose.model('User')

let editUser = (req, res) => {

    try {

        let options = {

            firstName: req.body.firstName,
            lastName: req.body.lastName,
            mobileNumber: req.body.mobileNumber,
            country: req.body.country,
            lastModified: time.now()
        }

        UserModel.updateOne({ 'userId': req.user.userId }, options).exec((err, result) => {
            if (err) {

                logger.error(err.message, 'User Controller:editUser', 10, err)
                let apiResponse = response.generate(true, 'Failed To edit user details', 500, null)
                res.status(apiResponse.status).send(apiResponse)

            } else if (check.isEmpty(result)) {

                logger.info('No user found', 'User Controller: editUser', 2)
                let apiResponse = response.generate(true, 'No user found', 404, null)
                res.status(apiResponse.status).send(apiResponse)

            } else {

                let apiResponse = response.generate(false, 'User details edited', 200, result)
                res.status(apiResponse.status).send(apiResponse)

            }
        });// end user model update


    } catch (err) {

        logger.error('Internal server Error', 'User Controller: editUser', 10, err)
        let apiResponse = response.generate(true, 'Internal server error', 500, null)
        res.status(apiResponse.status).send(apiResponse)

    }


}// end edit user

module.exports = {
    editUser: editUser
}// end exports