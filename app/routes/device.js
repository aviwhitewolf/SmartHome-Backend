const appConfig      = require("./../../config/appConfig")
const auth           = require('./../middlewares/auth')
const inputValidationMiddleware = require('./../middlewares/inputValidation').validation;

const createDeviceController = require("./../../app/controllers/device/createDevice").createDevice;
const editDeviceController = require("./../../app/controllers/device/editDevice").editDevice;
const getSingleDeviceController = require("./../../app/controllers/device/getSingleDevice").getDevice;
const getAllDeviceController = require("./../../app/controllers/device/getAllDevice").getAllDevice;
const {createDeviceSchema, editDeviceSchema, singleDeviceInfoSchema}     = require("./../services/Validation/devices")


module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/device`;

    // defining routes.

    // create device
    app.post(`${baseUrl}/create`,auth.isAuthorized, inputValidationMiddleware(createDeviceSchema), 
    createDeviceController);


    // // get single device info
    // app.get(`${baseUrl}/info`,auth.isAuthorized,
    // [
    //     body('homeId').isString().withMessage('Home id should be string'),
    //     body('homeId').isLength({min : 5, max : 15}).withMessage('Home id length should be greater than 5 and less than 15 '),
    //     body('deviceId').isString().withMessage('Device id should be string'),
    //     body('deviceId').isLength({min : 5, max : 15}).withMessage('Device id length should be greater than 5 and less than 15 ')
    // ],
    // inputValidationMiddleware.validate, 
    // getSingleDeviceController.getDevice);


    //edit device
    app.put(`${baseUrl}/edit`, auth.isAuthorized, inputValidationMiddleware(editDeviceSchema),
     editDeviceController);

    app.get(`${baseUrl}/all`,auth.isAuthorized, inputValidationMiddleware(singleDeviceInfoSchema), 
    getAllDeviceController);

}