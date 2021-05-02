const mongoose = require('mongoose');
const time = require('./../../libs/timeLib');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib')
const passwordLib = require('./../../libs/generatePasswordLib');
const token = require('../../libs/tokenLib');

/* Models */
const AdminModel = mongoose.model('Admin')
const AuthModel = mongoose.model('Auth')

let loginFunction = (req, res) => {

    let findAdmin = () => {

        return new Promise((resolve, reject) => {

            try {

                AdminModel.findOne({ email: req.body.email.toLowerCase() },
                    (err, userDetails) => {

                        if (err) {

                            logger.error('Failed To Retrieve Admin Data', 'adminController: findAdmin()', 10, err)
                            let apiResponse = response.generate(true, 'Failed to find Admin details', 500, null)
                            reject(apiResponse)

                        } else if (check.isEmpty(userDetails)) {

                            logger.error('No Admin Found', 'adminController: findAdmin()', 2)
                            let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                            reject(apiResponse)

                        } else {

                            logger.info('Admin Found', 'adminController: findAdmin()', 1)
                            resolve(userDetails)

                        }
                    });


            } catch (err) {

                logger.error('Internal server Error', 'adminController: findAdmin()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })
    }

    let validatePassword = (retrievedUserDetails) => {

        return new Promise((resolve, reject) => {

            try {

                passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {

                    if (err) {

                        logger.error(err.message, 'adminController: validatePassword()', 10, err)
                        let apiResponse = response.generate(true, 'Login Failed', 500, null)
                        reject(apiResponse)

                    } else if (isMatch) {

                        // converting to normal object from mongoose object
                        let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                        delete retrievedUserDetailsObj.password // delete vital piece of information which is not required buy users
                        delete retrievedUserDetailsObj._id
                        delete retrievedUserDetailsObj.__v
                        delete retrievedUserDetailsObj.createdOn
                        delete retrievedUserDetailsObj.lastModifiedBy
                        delete retrievedUserDetailsObj.lastModified
                        delete retrievedUserDetailsObj.isDelete
                        delete retrievedUserDetailsObj.isDeleteBy
                        delete retrievedUserDetailsObj.createdBy
                        resolve(retrievedUserDetailsObj)

                    } else {

                        logger.info('Login failed due to invalid password', 'adminController: validatePassword()', 2)
                        let apiResponse = response.generate(true, 'Wrong Password. Login Failed', 400, null)
                        reject(apiResponse)

                    }
                })

            } catch (err) {

                logger.error('Internal server Error', 'adminController: validatePassword()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })
    }

    let generateToken = (userDetails) => {

        return new Promise((resolve, reject) => {

            try {

                token.generateToken(userDetails, (err, tokenDetails) => {

                    if (err) {

                        logger.error(err.message, 'adminController: generateToken()', 10, err)
                        let apiResponse = response.generate(true, 'Failed to generate token', 500, null)
                        reject(apiResponse)

                    } else {

                        delete userDetails.adminId
                        tokenDetails.userDetails = userDetails
                        resolve(tokenDetails)

                    }
                })

            } catch (err) {

                logger.error('Internal server Error', 'adminController : generateToken()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })
    }

    let saveToken = (tokenDetails) => {

        return new Promise((resolve, reject) => {

            try {

                AuthModel.findOne({ userId: tokenDetails.adminId },
                    (err, retrievedTokenDetails) => {

                        if (err) {

                            logger.error(err.message, 'adminController : saveToken()', 10, err)
                            let apiResponse = response.generate(true, 'Failed to generate token', 500, null)
                            reject(apiResponse)

                        } else if (check.isEmpty(retrievedTokenDetails)) {

                            let newAuthToken = new AuthModel({
                                userId: tokenDetails.adminId,
                                authToken: tokenDetails.token,
                                tokenSecret: tokenDetails.tokenSecret,
                                tokenGenerationTime: time.now()
                            })

                            newAuthToken.save((err, newTokenDetails) => {

                                if (err) {

                                    logger.error(err.message, 'adminController : saveToken()', 10, err)
                                    let apiResponse = response.generate(true, 'Failed to generate token', 500, null)
                                    reject(apiResponse)

                                } else {

                                    delete tokenDetails.userDetails.adminId
                                    let responseBody = {
                                        authToken: newTokenDetails.authToken,
                                        userDetails: tokenDetails.userDetails

                                    }

                                    resolve(responseBody)

                                }
                            })

                        } else {

                            retrievedTokenDetails.authToken = tokenDetails.token
                            retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                            retrievedTokenDetails.tokenGenerationTime = time.now()
                            retrievedTokenDetails.save((err, newTokenDetails) => {

                                if (err) {

                                    logger.error(err.message, 'adminController: saveToken()', 10, err)
                                    let apiResponse = response.generate(true, 'Failed to generate token', 500, null)
                                    reject(apiResponse)

                                } else {

                                    let responseBody = {
                                        authToken: newTokenDetails.authToken,
                                        userDetails: tokenDetails.userDetails
                                    }

                                    resolve(responseBody)

                                }
                            })
                        }

                    })

            } catch (err) {

                logger.error('Internal server Error', 'adminController : saveToken()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }


    findAdmin(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {

            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(apiResponse.status).send(apiResponse)

        })
        .catch((err) => {

            res.status(err.status).send(err)

        })

}//end of login function


module.exports = {
    login: loginFunction
}// end exports