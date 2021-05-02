const mongoose = require('mongoose');
const shortid  = require('shortid');
const time     = require('./../../libs/timeLib');
const response = require('./../../libs/responseLib')
const logger   = require('./../../libs/loggerLib');
const check    = require('../../libs/checkLib')

/* Models */
const HomeModel = mongoose.model('Home')
const DailyUserPlanModel = mongoose.model('DailyUserPlan')

let createHomeFunction = (req, res) => {
 
   let checkUserDailyPlan = () => {
               
    return new Promise((resolve, reject) => {

        try {

            DailyUserPlanModel.findOne({ userId: req.user.userId })
            .exec((err, result) => {

                if (err) {
    
                    logger.error(err.message, 'homeController : createHomeFunction() : checkDailyUserPlan()', 10, err)
                    let apiResponse = response.generate(true, 'Failed to update daily user plan', 500, null)
                    reject(apiResponse)
    
                } else if (check.isEmpty(result)) {

                    logger.error('Daily user plan not found.', 'homeController : createHomeFunction() : checkDailyUserPlan()', 4)
                    let apiResponse = response.generate(true, 'Daily user plan not found', 403, null)
                    reject(apiResponse)

                } else {

                    if(result.homeLimit  - 1 >= 0){
                        req.homeLimit = result.homeLimit 
                        resolve()

                    }else{

                    logger.info('Upgrade your plan to add more homes', 'homeController : createHomeFunction() : checkDailyUserPlan()', 5)
                    let apiResponse = response.generate(true, 'Upgrade your plan to add more homes', 403, null)
                    reject(apiResponse)


                    }
                }
            })
    

        } catch (err) {
            
            logger.error('Internal server Error', 'homeController : createHomeFunction() : checkUserDailyPlan()', 10, err)
            let apiResponse = response.generate(true, 'Internal server error', 500, null)
            reject(apiResponse)

        }

    })

   }

    let createHome = () => {

        return new Promise((resolve, reject) => {

        try{

            let today = time.now();
            let homeId = shortid.generate();
            let voltage = (check.isEmpty(req.body.voltage) ? 0 : (isNaN(req.body.voltage) ? 0 : req.body.voltage))
            let location = { type: 'Point', coordinates: [(check.isEmpty(req.body.lng) && !isNaN(req.body.lng) ? 0.0 : req.body.lng), (check.isEmpty(req.body.lat) && !isNaN(req.body.lat) ? 0.0 : req.body.lat)] }

            let newHome = new HomeModel({
                homeId: homeId,
                userId: req.user.userId,
                name: req.body.homeName,
                location: location,
                createdOn: today,
                activeDevices: 0,
                voltage: voltage
            })

            newHome.save((err, result) => {

                if (err) {
                    
                    logger.error(err.message, 'Home Controller: createHome', 10, err)
                    reject(response.generate(true, 'Failed to create new home', 500, null))

                } else if (check.isEmpty(result)) {
                    
                    logger.info('No home found', 'Home Controller: createHome', 1)
                    reject(response.generate(true, 'Failed to create new home', 404, null))

                } else {

                    let newHomeObj = result.toObject();
                    delete newHomeObj.__v
                    delete newHomeObj._id
                    delete newHomeObj.userId

                    resolve(newHomeObj)
                }

            })

        }catch(err){
            logger.error('Internal server Error', 'Home Controller: createHome', 10, err)
            reject(response.generate(true, 'Internal server error', 500, null))
        }

        })

    }

    let updateUserDailyPlan = () => {
               
        return new Promise((resolve, reject) => {

            try {
   
                let updateDailyUserPlan = {           
                    
                    homeLimit     : req.homeLimit - 1,
                    lastModified  : time.now()
                
                }

                DailyUserPlanModel.updateOne({ 'userId': req.user.userId }, updateDailyUserPlan)
                .exec((err, result) => {

                    if (err) {

                        logger.error(err.message, 'homeController : createHomeFunction() : updateDailyUserPlan()', 10, err)
                        let apiResponse = response.generate(true, 'Failed to update daily user plan', 500, null)
                        reject(apiResponse)

                    } else {

                        resolve()

                    }
                })
   
            } catch (err) {
                
                logger.error('Internal server Error', 'homeController : createHomeFunction() : updateDailyUserPlan()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }

    checkUserDailyPlan(req, res)
    .then(createHome)
    .then(updateUserDailyPlan)
    .then((resolve) => {

        let apiResponse = response.generate(false, 'New home created successfully', 200, resolve);
        res.status(apiResponse.status).send(apiResponse)
        
    })
    .catch((err) => {
    res.status(err.status).send(err);
    })



}//end home creation function

module.exports = {
    createHome  : createHomeFunction
}// end exports