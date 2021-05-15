const mongoose = require('mongoose');
const time = require('./../../libs/timeLib');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');

/* Models */
const PlanModel = mongoose.model('Plan')

let editPlanFunction = (req, res) => {

    //check if person is authorised to add admin, proper rights
    let checkAuthorization = () => {

        return new Promise((resolve, reject) => {

            try {

                if (req.hasOwnProperty('result')  && req.result.level <= 2) {
                    
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

    let editPlan = () => {

        return new Promise((resolve, reject) => {

            try {

                let editPlan = {
                    planName       : req.body.planName,
                    description    : req.body.description,
                    homeLimit      : req.body.connectedHomeLimit,
                    deviceLimit    : req.body.connectedDeviceLimit,
                    roomLimit      : req.body.connectedRoomLimit,
                    requestPerDay  : req.body.requestPerDay,
                    price          : req.body.price,
                    currency       : req.body.currency,
                    lastModifiedBy : req.user.adminId,
                    lastModified   : time.now(),
                    toShow         : req.body.toShow
                }

                PlanModel.updateOne({ 'planId': req.body.planId }, editPlan).exec((err, result) => {

                    if (err) {

                        logger.error(err.message, 'planController: createPlan', 10, err)
                        let apiResponse = response.generate(true, 'Failed to edit new plan', 500, null)
                        reject(apiResponse)

                    } else {

                        resolve(result)

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
        .then(editPlan)
        .then((resolve) => {

            let apiResponse = response.generate(false, 'Plan updated successfuly', 200, resolve);
            res.status(apiResponse.status).send(apiResponse)

        })
        .catch((err) => {
            res.status(err.status).send(err);
        })
        

}

module.exports = {
editPlan    : editPlanFunction
}// end exports