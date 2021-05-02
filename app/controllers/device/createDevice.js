const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../../libs/timeLib');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib');

const HomeModel   = mongoose.model('Home')
const RoomModel   = mongoose.model('Room')
const DeviceModel = mongoose.model('Device')
const DailyUserPlanModel = mongoose.model('DailyUserPlan')

let createDeviceFunction = (req, res) => {


    let checkUserDailyPlan = () => {
                          
    return new Promise((resolve, reject) => {

        try {

            DailyUserPlanModel.findOne({ userId: req.user.userId })
            .exec((err, result) => {

                if (err) {
    
                    logger.error(err.message, 'createDeviceFunction : checkDailyUserPlan()', 10, err)
                    let apiResponse = response.generate(true, 'Failed to update daily user plan', 500, null)
                    reject(apiResponse)
    
                } else if (check.isEmpty(result)) {

                    logger.error('Daily user plan not found.', 'createDeviceFunction : checkDailyUserPlan()', 4)
                    let apiResponse = response.generate(true, 'Daily user plan not found', 403, null)
                    reject(apiResponse)

                } else {

                    if(result.deviceLimit  - req.body.devices.length >= 0){
                        req.deviceLimit = result.deviceLimit 
                        resolve()

                    }else{

                        logger.info('Upgrade your plan to add more devices', 'createDeviceFunction : checkDailyUserPlan()', 5)
                        let apiResponse = response.generate(true, 'Upgrade your plan to add more devices', 403, null)
                        reject(apiResponse)

                    }
                }
            })
    

        } catch (err) {
            
            logger.error('Internal server Error', 'createDeviceFunction : checkUserDailyPlan()', 10, err)
            let apiResponse = response.generate(true, 'Internal server error', 500, null)
            reject(apiResponse)

        }

    })

    }

    /*@
    TODO : Merge both findHome and findRoom, using joins 
    */

    let findHome = () => {

        return new Promise((resolve, reject) => {
         
        try {
                
            HomeModel.findOne({homeId : req.body.homeId, userId: req.user.userId}, (err, homeDetails) => {

                if (err) {
                    
                    logger.error('Failed to retrieve home data', 'deviceController: findHome()', 10, err)
                    let apiResponse = response.generate(true, 'Failed to find home details', 500, null)
                    reject(apiResponse)

                } else if (check.isEmpty(homeDetails)) {
                    
                    logger.info('No home found', 'deviceController: findHome()', 1)
                    let apiResponse = response.generate(true, 'No home details found', 404, null)
                    reject(apiResponse)

                } else {
                    
                    logger.info('Home found', 'deviceController: findHome()', 10)
                    resolve(homeDetails)

                }

            })

        } catch (err) {
                 
            logger.error('Internal server Error', 'Device Controller: findHome', 10, err)
            let apiResponse = response.generate(true, 'Internal server error', 500, null)
            reject(apiResponse)
        
        }

        })

    }
 
    let findRoom = () => {

        return new Promise((resolve, reject) => {
         
        try {
                
            RoomModel.findOne({roomId : req.body.roomId,
                 userId : req.user.userId, 
                 homeId : req.body.homeId
                }, (err, roomDetails) => {

                if (err) {
                    
                    logger.error('Failed to retrieve room data', 'deviceController: findRoom()', 10, err)
                    let apiResponse = response.generate(true, 'Failed to find room details', 500, null)
                    reject(apiResponse)

                } else if (check.isEmpty(roomDetails)) {
                    
                    logger.info('No Room found', 'deviceController: findRoom()', 1)
                    let apiResponse = response.generate(true, 'No room details found', 404, null)
                    reject(apiResponse)

                } else {
                    
                    logger.info('Room found', 'deviceController: findRoom()', 10)
                    resolve(roomDetails)

                }

            })

        } catch (err) {
                 
            logger.error('Internal server Error', 'Device Controller: findRoom', 10, err)
            let apiResponse = response.generate(true, 'Internal server error', 500, null)
            reject(apiResponse)
        
        }

        })

    }

    // let createDevice = () => {

    //     return new Promise((resolve, reject) => {

    //     try{

    //         let today    = time.now();
    //         let deviceId = shortid.generate();

    //         let state    = Number(0);
    //         let voltage  = Number(0); 

    //         if(parseInt(req.body.state) == 0 || parseInt(req.body.state) == 1){
    //             state = parseInt(req.body.state)
    //         }
            
    //         if(parseInt(req.body.voltage) >= 0 && parseInt(req.body.voltage) <= 255){
    //             voltage = parseInt(req.body.voltage)
    //         }

    //         let extra  = (req.body.extra ? req.body.extra : '')
        
    //         let newDevice     = new DeviceModel({
    //             deviceId      : deviceId, 
    //             homeId        : req.body.homeId,
    //             userId        : req.user.userId,
    //             roomId        : req.body.roomId,
    //             name          : req.body.deviceName,
    //             icon          : device.icon || '',
    //             state         : state,
    //             createdOn     : today,
    //             lastModified  : today,
    //             voltage       : voltage,
    //             extra         : extra
    //         })


    //         newDevice.save((err, result) => {

    //             if (err) {
                    
    //                 logger.error(err.message, 'Device Controller: createDevice', 10, err)
    //                 let apiResponse = response.generate(true, 'Failed to create new device', 500, null);
    //                 reject(apiResponse)

    //             } else if (check.isEmpty(result)) {
                    
    //                 logger.info('No device found', 'Device Controller: createdevice', 5)
    //                 let apiResponse = response.generate(true, 'Failed to create new device', 404, null);
    //                 reject(apiResponse)
                
    //             } else {
                    
    //                 let newDeviceObj = result.toObject();
    //                 delete newDeviceObj.__v
    //                 delete newDeviceObj._id
    //                 delete newDeviceObj.userId

    //                 resolve(newDeviceObj)
    //             }

    //         })

    //     } catch (err) {
                 
    //         logger.error('Internal server Error', 'Device Controller: createDevice', 10, err)
    //         let apiResponse = response.generate(true, 'Internal server error', 500, null)
    //         reject(apiResponse)
        
    //     }

    //     })

    // }

    let createDevice = () => {

        return new Promise((resolve, reject) => {

            try {

                let today    = time.now();
                let devices = req.body.devices
                let deviceArray = []

                devices.forEach( device => {

                let state    = Number(0);
                let voltage  = Number(0); 

                if(parseInt(device.state) == 0 || parseInt(device.state) == 1){
                    state = parseInt(device.state)
                }
                
                if(parseInt(device.voltage) >= 0 && parseInt(device.voltage) <= 255){
                    voltage = parseInt(device.voltage)
                }

                let extra  = (device.extra ? device.extra : '')

                    let deviceObject = {

                        deviceId     : shortid.generate(),
                        userId       : req.user.userId,
                        homeId       : req.body.homeId,
                        roomId       : req.body.roomId,
                        name         : device.deviceName,
                        icon         : device.icon || '',
                        createdOn    : today,
                        lastModified : today,
                        state        : state,
                        voltage      : voltage,
                        extra        : extra

                    }

                    deviceArray.push(deviceObject)

                });

                DeviceModel.collection.insertMany(deviceArray ,(err, result) => {

                    if (err) {

                        logger.error(err.message, 'roomController : createDevice()', 10, err)
                        let apiResponse = response.generate(true, 'Failed to create device', 500, null);
                        reject(apiResponse)

                    } else if (check.isEmpty(result)) {

                        logger.info('No device found', 'roomController : createDevice()', 5)
                        let apiResponse = response.generate(true, 'Failed to create new device', 404, null);
                        reject(apiResponse)

                    } else {

                        resolve()
                    }

                })

            } catch (err) {

                logger.error('Internal server Error', 'roomController : createDevice()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })
    }


    let updateUserDailyPlan = () => {
               
        return new Promise((resolve, reject) => {

            try {
   
                let updateDailyUserPlan = {
                            
                    deviceLimit   : req.deviceLimit - req.body.devices.length,
                    lastModified  : time.now()

                }

                DailyUserPlanModel.updateOne({ 'userId': req.user.userId }, updateDailyUserPlan)
                .exec((err, result) => {

                    if (err) {

                        logger.error(err.message, 'deviceController : createDeviceFunction() : updateDailyUserPlan()', 10, err)
                        let apiResponse = response.generate(true, 'Failed to update daily user plan', 500, null)
                        reject(apiResponse)

                    } else {

                        resolve()

                    }
                })
   
            } catch (err) {
                
                logger.error('Internal server Error', 'deviceController : createDeviceFunction() : updateDailyUserPlan()', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }

    checkUserDailyPlan(req, res)
    .then(findHome)
    .then(findRoom)
    .then(createDevice)
    .then(updateUserDailyPlan)
    .then((resolve) => {
      
        let apiResponse = response.generate(false, 'New device created successfully', 200, resolve);
        res.status(apiResponse.status).send(apiResponse)
    
    })
    .catch((err) => {
        res.status(err.status).send(err);
    })

} // end of devicecreation function


module.exports = {
    createDevice : createDeviceFunction
}// end exports