const mongoose = require('mongoose');
const response = require('./../../libs/responseLib')
const logger   = require('./../../libs/loggerLib');
const check    = require('../../libs/checkLib')

/* Models */
const HomeModel = mongoose.model('Home')

let getHomeListFunction = (req, res) => {

    try {
        
        HomeModel.find({ 'userId': req.user.userId })
        .select('-password -__v -_id -userId')
        .exec((err, result) => {
            if (err) {
                
                logger.error(err.message, 'Home Controller : getHomeList', 10, err)
                let apiResponse = response.generate(true, 'Failed to edit home details', 500, null)
                res.status(apiResponse.status).send(apiResponse)

            } else if (check.isEmpty(result)) {
                
                logger.info('No home found', 'Home Controller: getHomeList', 1)
                let apiResponse = response.generate(true, 'No home found', 404, null)
                res.status(apiResponse.status).send(apiResponse)

            } else {
               
                let apiResponse = response.generate(false, 'Home list found successfully', 200, result)
                res.status(apiResponse.status).send(apiResponse)
            
            }
        });


    } catch (err) {

        logger.error('Internal server Error', 'Home Controller: getHomeList', 10, err)
        let apiResponse = response.generate(true, 'Internal server error', 500, null)
        res.status(apiResponse.status).send(apiResponse)
        
    }

}//end home list

module.exports = {
    getHomeList : getHomeListFunction
}// end exports