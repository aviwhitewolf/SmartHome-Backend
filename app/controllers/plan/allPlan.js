const mongoose = require('mongoose');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib')

/* Models */
const PlanModel = mongoose.model('Plan')

let getAllPlanFunction = (req, res) => {

        try {
            
            PlanModel.find({'toShow': 1, 'isDelete': 0})
            .select('-__v -_id -createdBy -lastModifiedBy -lastModified -createdOn -isDelete -isDeleteBy -toShow')
            .exec((err, result) => {

                if (err) {
          
                    logger.error(err.message, 'Plan Controller : getAllPlanFunction', 10, err)
                    let apiResponse = response.generate(true, 'Failed to find device details', 500, null)
                    res.status(apiResponse.status).send(apiResponse)
                
                } else if (check.isEmpty(result)) {
                
                    logger.info('No plan found', 'Plan Controller : getAllPlanFunction', 1)
                    let apiResponse = response.generate(true, 'No plan found', 404, null)
                    res.status(apiResponse.status).send(apiResponse)
                
                } else {
                
                    let apiResponse = response.generate(false, 'Plan found', 200, result);
                    res.status(apiResponse.status).send(apiResponse)
                
                }
            })

        } catch (err) {
          
            logger.error('Internal server Error', 'Plan Controller: getAllPlanFunction', 10, err)
            let apiResponse = response.generate(true, 'Internal server error', 500, null)
            reject(apiResponse)

        }


}

module.exports = {
    allPlan     : getAllPlanFunction
}// end exports