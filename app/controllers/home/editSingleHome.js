const mongoose = require('mongoose');
const time     = require('./../../libs/timeLib');
const response = require('./../../libs/responseLib')
const logger   = require('./../../libs/loggerLib');
const check    = require('../../libs/checkLib')

/* Models */
const HomeModel = mongoose.model('Home')

let editSingleHomeFunction = (req, res) => {

    try{
        let location = { type: 'Point', coordinates: [req.body.lng, req.body.lat] }
        let voltage = ((!isNaN(req.body.voltage) && req.body.voltage < 1000) ? req.body.voltage : 0);

        let options = {
            name: req.body.homeName,
            location: location,
            voltage: voltage,
            lastModified: time.now()
        }

        HomeModel.updateOne({ 'homeId': req.body.homeId }, options)
            .exec((err, result) => {

                if (err) {

                    logger.error(err.message, 'Home Controller:editSingleHomeFunction', 10, err)
                    let apiResponse = response.generate(true, 'Failed to edit home details', 500, null)
                    res.status(apiResponse.status).send(apiResponse)
                
                } else if (check.isEmpty(result)) {
                
                    logger.info('No home found', 'Home Controller: editSingleHomeFunction', 1)
                    let apiResponse = response.generate(true, 'No home found', 404, null)
                    res.status(apiResponse.status).send(apiResponse)
                
                } else {
                
                    let apiResponse = response.generate(false, 'Home details edited', 200, result)
                    res.status(apiResponse.status).send(apiResponse)
                
                }
            });

        }catch(err){

            logger.error('Internal server Error', 'Home Controller: createHome', 10, err)
            let apiResponse = response.generate(true, 'Internal server error', 500, null)
            res.status(apiResponse.status).send(apiResponse)

        }

}//end edit Single Home

module.exports = {
    editHome    : editSingleHomeFunction
}// end exports