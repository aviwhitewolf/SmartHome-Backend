const mongoose = require('mongoose');
const time = require('./../../libs/timeLib');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib')
const passwordLib = require('./../../libs/generatePasswordLib');
const token = require('../../libs/tokenLib');

/* Models */
const UserModel = mongoose.model('User')
const AuthModel = mongoose.model('Auth')

let loginFunction = (req, res) => {

    let findUser = () => {

        return new Promise((resolve, reject) => {

            try {

                UserModel.findOne({ email: req.body.email.toLowerCase() }, (err, userDetails) => { // userDetail is a returned result form MongoDB

                    if (err) {

                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10, err)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)

                    } else if (check.isEmpty(userDetails)) {

                        logger.error('No User Found', 'userController: findUser()', 2)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)

                    } else {

                        logger.info('User Found', 'userController: findUser()', 1)
                        resolve(userDetails)

                    }
                });


            } catch (err) {

                logger.error('Internal server Error', 'User Controller: loginFunction()', 10, err)
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

                        logger.error(err.message, 'userController: validatePassword()', 10, err)
                        let apiResponse = response.generate(true, 'Login Failed', 500, null)
                        reject(apiResponse)

                    } else if (isMatch) {

                        // converting to normal object from mongoose object
                        let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                        delete retrievedUserDetailsObj.password // delete vital piece of information which is not required buy users
                        delete retrievedUserDetailsObj._id
                        delete retrievedUserDetailsObj.__v
                        delete retrievedUserDetailsObj.createdOn
                        delete retrievedUserDetailsObj.modifiedOn
                        resolve(retrievedUserDetailsObj)

                    } else {

                        logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 2)
                        let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                        reject(apiResponse)

                    }
                })

            } catch (err) {

                logger.error('Internal server Error', 'User Controller: validatePassword()', 10, err)
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

                        logger.error(err.message, 'userController: generateToken()', 10, err)
                        let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                        reject(apiResponse)

                    } else {

                        tokenDetails.userId = userDetails.userId
                        tokenDetails.userDetails = userDetails
                        resolve(tokenDetails)

                    }
                })

            } catch (err) {

                logger.error('Internal server Error', 'User Controller: generateToken()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })
    }

    let saveToken = (tokenDetails) => {

        return new Promise((resolve, reject) => {

            try {

                AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {

                    if (err) {

                        logger.error(err.message, 'userController: saveToken()', 10, err)
                        let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                        reject(apiResponse)

                    } else if (check.isEmpty(retrievedTokenDetails)) {

                        let newAuthToken = new AuthModel({
                            userId: tokenDetails.userId,
                            authToken: tokenDetails.token,
                            tokenSecret: tokenDetails.tokenSecret,
                            tokenGenerationTime: time.now()
                        })

                        newAuthToken.save((err, newTokenDetails) => {

                            if (err) {

                                logger.error(err.message, 'userController: saveToken', 10, err)
                                let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                                reject(apiResponse)

                            } else {

                                delete tokenDetails.userDetails.userId
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

                                logger.error(err.message, 'userController: saveToken', 10, err)
                                let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                                reject(apiResponse)

                            } else {

                                delete tokenDetails.userDetails.userId

                                let responseBody = {
                                    authToken: newTokenDetails.authToken,
                                    userDetails: tokenDetails.userDetails
                                }

                                resolve(responseBody)

                            }
                        })
                    }

                })

            } catch (error) {

                logger.error('Internal server Error', 'User Controller: saveToken()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }


    findUser(req, res)
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
    loginFunction: loginFunction
}// end exports