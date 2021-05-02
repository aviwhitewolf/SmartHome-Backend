const mongoose = require('mongoose');
const response = require('./../../libs/responseLib')
const logger   = require('./../../libs/loggerLib');
const check    = require('../../libs/checkLib')

/* Models */
const HomeModel = mongoose.model('Home')

let getSingleHomeFunction = (req, res) => {

    //find Home
    let findHome = () => {
        return new Promise((resolve, reject) => {

            try {
                    
            HomeModel.aggregate([
                {
                    $lookup:
                       {
                         from: "devices",
                         let: { homeId: "$homeId"},
                         pipeline: [
                            { $match:
                               { $expr:
                                  { $and:
                                     [
                                       { $eq: [ "$homeId",  "$$homeId" ] }
                                     ]
                                  }
                               }
                            },
                            { $project: { _id: 0, userId : 0, __v : 0, lastModified : 0, createdOn : 0, homeId : 0} }
                         ],
                         as: "devices"
                       }
                  }
               ])
             .match({homeId : req.body.homeId})
             .project({userId : 0, _id : 0, lastModified : 0, createdOn : 0, __v : 0})
             .exec((err, result) => {

                    if (err) {

                        logger.error(err.message, 'Home Controller: getSingleHome', 10, err)
                        let apiResponse = response.generate(true, 'Failed To Find Home Details', 500, null)
                        reject(apiResponse)
                    
                    } else if (check.isEmpty(result)) {
                    
                        logger.info('No home Found', 'Home Controller:getSingleHome', 1)
                        let apiResponse = response.generate(true, 'No Home Found', 404, null)
                        reject(apiResponse)
                    
                    } else {
        
                        resolve(result)
        
                    }

                })
        
            } catch (err) {
              
                logger.error('Internal server Error', 'Home Controller: getSingleHomeFunction', 10, err)
                reject(response.generate(true, 'Internal server error', 500, null))

            }

        })
    }


    findHome(req, res)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Home found', 200, resolve);
            res.status(apiResponse.status).send(apiResponse)
        })
        .catch((err) => {
            res.status(err.status).send(err);
        })

}//end get single home 

module.exports = {
getHome     : getSingleHomeFunction
}// end exports