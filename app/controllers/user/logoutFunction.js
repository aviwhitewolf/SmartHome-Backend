const mongoose = require('mongoose');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib')
const check = require('../../libs/checkLib')

/* Models */
const AuthModel = mongoose.model('Auth')

let logoutFunction = (req, res) => {

    try {

        AuthModel.remove({ userId: req.user.userId }, (err, result) => {
            if (err) {

                logger.error(err.message, 'user Controller: logout', 10, err)
                let apiResponse = response.generate(true, 'Error in logging out', 500, null)
                res.status(apiResponse.status).send(apiResponse)

            } else if (check.isEmpty(result)) {

                logger.error('Already Logged Out or Invalid UserId', 'User Controller: logout', 2)
                let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
                res.status(apiResponse.status).send(apiResponse)

            } else {

                let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
                res.status(apiResponse.status).send(apiResponse)

            }
        })

    } catch (err) {

        logger.error('Internal server Error', 'User Controller: logout', 10, err)
        let apiResponse = response.generate(true, 'Internal server error', 500, null)
        res.status(apiResponse.status).send(apiResponse)


    }
} // end of the logout function.

module.exports = {
    logout: logoutFunction

}// end exports