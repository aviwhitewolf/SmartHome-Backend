const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../../libs/timeLib');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib')
const passwordLib = require('./../../libs/generatePasswordLib');

/* Models */
const UserModel = mongoose.model('User')
const PlanModel = mongoose.model('Plan')
const DailyUserPlanModel = mongoose.model('DailyUserPlan')

let signUpFunction = (req, res) => {

    let createUser = () => {

        return new Promise((resolve, reject) => {

            try {

                UserModel.findOne({ email: req.body.email })
                    .exec((err, result) => {

                        if (err) {

                            logger.error(err.message, 'userController: createUser', 10, err)
                            let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                            reject(apiResponse)

                        } else if (check.isEmpty(result)) {

                            let userId = shortid.generate();

                            let newUser = new UserModel({
                                userId: userId,
                                firstName: req.body.firstName,
                                lastName: req.body.lastName || '',
                                email: req.body.email.toLowerCase(),
                                mobileNumber: req.body.mobileNumber,
                                password: passwordLib.hashpassword(req.body.password),
                                createdOn: time.now(),
                                country: req.body.country

                            })
                            newUser.save((err, newUser) => {

                                if (err) {

                                    logger.error(err.message, 'userController: createUser', 10, err)
                                    let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                    reject(apiResponse)

                                } else {

                                    let newUserObj = newUser.toObject();
                                    delete newUserObj.__v
                                    delete newUserObj._id
                                    delete newUserObj.userId
                                    req.userId = userId
                                    resolve(newUserObj)

                                }
                            })
                        } else {

                            logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                            let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                            reject(apiResponse)

                        }
                    })


            } catch (err) {

                logger.error('Internal server Error', 'User Controller: createUser', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })
    }// end create user function

    let getPlan = () => {

        return new Promise((resolve, reject) => {

            try {

                PlanModel.findOne({ "planName": "FREE" }, (err, result) => {

                    if (err) {

                        logger.error('Failed To retrive plan data', 'userController : getPlan()', 10, err)
                        let apiResponse = response.generate(true, 'Failed to find plan details', 500, null)
                        reject(apiResponse)

                    } else if (check.isEmpty(result)) {

                        logger.error('No plan found', 'userController : getPlan()', 2)
                        let apiResponse = response.generate(true, 'No plan details found', 404, null)
                        reject(apiResponse)

                    } else {

                        logger.info('Plan found', 'userController : getPlan()', 1)
                        resolve(result)

                    }


                })


            } catch (err) {

                logger.error('Internal server Error', 'User Controller : getPlan()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }

    let createDailyUserPlan = (plan) => {

        return new Promise((resolve, reject) => {

            try {

                DailyUserPlanModel.findOne({ userId: req.userId })
                    .exec((err, result) => {

                        if (err) {

                            logger.error(err.message, 'userController : createDailyUserPlan()', 10, err)
                            let apiResponse = response.generate(true, 'Failed to create daily user plan', 500, null)
                            reject(apiResponse)

                        } else if (check.isEmpty(result)) {

                            let newDailyUserPlan = new DailyUserPlanModel({

                                userId: req.userId,
                                connectedHomeLimit: plan.connectedHomeLimit,
                                connectedDeviceLimit: plan.connectedDeviceLimit,
                                connectedRoomLimit: plan.connectedRoomLimit,
                                requestPerDayLimit: plan.requestPerDayLimit,
                                lastModified: time.now(),
                                createdOn: time.now()

                            })

                            newDailyUserPlan.save((err, newDailyUserPlan) => {

                                if (err) {

                                    logger.error(err.message, 'userController : createDailyUserPlan()', 10, err)
                                    let apiResponse = response.generate(true, 'Failed to create new daily user plan', 500, null)
                                    reject(apiResponse)

                                } else {

                                    let newObj = newDailyUserPlan.toObject();
                                    delete newObj.__v
                                    delete newObj._id
                                    delete newObj.userId
                                    delete newObj.roomName
                                    delete newObj.lastModified
                                    delete newObj.createdOn
                                    resolve(newObj)

                                }
                            })
                        } else {

                            logger.error('Daily user plan cannot be created. Plan already present', 'userController: createDailyUserPlan()', 4)
                            let apiResponse = response.generate(true, 'Daily user plan already present', 403, null)
                            reject(apiResponse)

                        }
                    })


            } catch (err) {

                logger.error('Internal server Error', 'User Controller: createDailyUserPlan()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }

    //Creating Promises, Execute in Sequence Async
    //if any function fails then throw error 
    createUser(req, res)
        .then(getPlan)
        .then(createDailyUserPlan)
        .then((resolve) => {

            delete resolve.password
            let apiResponse = response.generate(false, 'User created', 200, resolve)
            res.status(apiResponse.status).send(apiResponse)

        })
        .catch((err) => {

            res.status(err.status).send(err);

        })


}// end user signup function 

module.exports = {
    signUpFunction: signUpFunction
}// end exports