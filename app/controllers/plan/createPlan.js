const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../../libs/timeLib');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');

/* Models */
const PlanModel = mongoose.model('Plan')

let createPlanFunction = (req, res) => {

    //check if person is authorised to add admin, proper rights
    let checkAuthorization = () => {

        return new Promise((resolve, reject) => {

            try {

                if (req.hasOwnProperty('result') && req.result.level <= 2) {
                    
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

    let createPlan = () => {

        return new Promise((resolve, reject) => {

            try {

                let newPlan = new PlanModel({
                    planId: shortid.generate(),
                    planName: req.body.planName,
                    description: req.body.description,
                    homeLimit : req.body.homeLimit,
                    deviceLimit : req.body.deviceLimit,
                    roomLimit   : req.body.roomLimit,
                    requestPerDay : req.body.requestPerDay,
                    price : req.body.price,
                    currency : req.body.currency,
                    createdOn: time.now(),
                    createdBy: req.user.adminId,
                    lastModifiedBy: req.user.adminId,
                    lastModified: time.now(),
                    toShow      : req.body.toShow
                })

                newPlan.save((err, createdPlan) => {

                    if (err) {

                        logger.error(err.message, 'planController: createPlan', 10, err)
                        let apiResponse = response.generate(true, 'Failed to create new plan', 500, null)
                        reject(apiResponse)

                    } else {

                        let newUserObj = createdPlan.toObject();
                        
                        delete newUserObj.__v
                        delete newUserObj._id
                        delete newUserObj.createdBy
                        delete newUserObj.lastModifiedBy
                        delete newUserObj.lastModified
                        delete newUserObj.createdOn
                        delete newUserObj.isDelete
                        delete newUserObj.isDeleteBy
                        delete newUserObj.toShow

                        resolve(newUserObj)

                    }
                })

            } catch (err) {

                logger.error('Internal server Error', 'Plan Controller: createPlan', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }

    checkAuthorization(req, res)
        .then(createPlan)
        .then((resolve) => {

            let apiResponse = response.generate(false, 'New plan created successfuly', 200, resolve);
            res.status(apiResponse.status).send(apiResponse)

        })
        .catch((err) => {
            res.status(err.status).send(err);
        })


}

module.exports = {
createPlan  : createPlanFunction
}// end exports