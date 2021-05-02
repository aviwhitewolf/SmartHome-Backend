const express        = require('express');
const router         = express.Router();
const appConfig      = require("./../../config/appConfig")
const auth           = require('./../middlewares/auth')
const inputValidationMiddleware = require('./../middlewares/inputValidation');
const { body}                   = require('express-validator');

const createDeviceController = require("./../../app/controllers/device/createDevice");
const editDeviceController = require("./../../app/controllers/device/editDevice");
const getSingleDeviceController = require("./../../app/controllers/device/getSingleDevice");
const getAllDeviceController = require("./../../app/controllers/device/getAllDevice");

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/device`;

    // defining routes.

    // create device
    app.post(`${baseUrl}/create`,auth.isAuthorized,
    [
        body('homeId').isString().withMessage('Home id should be string'),
        body('homeId').isLength({min : 5, max : 15}).withMessage('Home id length should be greater than 5 and less than 15 '),
        body('roomId').isString().withMessage('Room id should be string'),
        body('roomId').isLength({min : 5, max : 15}).withMessage('Room id length should be greater than 5 and less than 15 '),
        body('devices').isArray().withMessage('Device data missing'),
        body('devices.*.deviceName').isString().withMessage('Device name should be string'),
        body('devices.*.deviceName').isLength({min : 2, max : 25}).withMessage('Device name length should be greater than 3 and less than 25'),
        body('devices.*.state').isInt({ge : 0, le : 1}).withMessage('State should be whole number 0 or 1'),
        body('devices.*.voltage').isInt({ge : 0, le : 255}).withMessage('Voltage should be whole number between 0 to 255')
    
    ],
    inputValidationMiddleware.validate, 
    createDeviceController.createDevice);


    // get single device info
    app.get(`${baseUrl}/info`,auth.isAuthorized,
    [
        body('homeId').isString().withMessage('Home id should be string'),
        body('homeId').isLength({min : 5, max : 15}).withMessage('Home id length should be greater than 5 and less than 15 '),
        body('deviceId').isString().withMessage('Device id should be string'),
        body('deviceId').isLength({min : 5, max : 15}).withMessage('Device id length should be greater than 5 and less than 15 ')
    ],
    inputValidationMiddleware.validate, 
    getSingleDeviceController.getDevice);


    //edit device
    app.put(`${baseUrl}/edit`, auth.isAuthorized, 
    [   
        body('homeId').isString().withMessage('Home id should be string'),
        body('homeId').isLength({min : 5, max : 15}).withMessage('Home id length should be greater than 5 and less than 15 '),
        body('roomId').isString().withMessage('Room id should be string'),
        body('roomId').isLength({min : 5, max : 15}).withMessage('Room id length should be greater than 5 and less than 15 '),
        body('devices.*.deviceId').isString().withMessage('Device id should be string'),
        body('devices.*.deviceId').isLength({min : 5, max : 15}).withMessage('Device id length should be greater than 5 and less than 15 '),    
        body('devices.*.deviceName').isString().withMessage('Device name should be string'),
        body('devices.*.deviceName').isLength({min : 2, max : 25}).withMessage('Device name length should be greater than 3 and less than 25'),
        body('devices.*.state').isInt({ge : 0, le : 1}).withMessage('State should be whole number 0 or 1'),
        body('devices.*.voltage').isInt({ge : 0, le : 255}).withMessage('Voltage should be whole number between 0 to 255')
    
    ],
    inputValidationMiddleware.validate, 
    editDeviceController.editDevice);

    app.get(`${baseUrl}/all`,auth.isAuthorized,
    [
        body('homeId').isString().withMessage('Home id should be string'),
        body('homeId').isLength({min : 5, max : 15}).withMessage('Home id length should be greater than 5 and less than 15 '),
        body('roomId').isString().withMessage('Room id should be string'),
        body('roomId').isLength({min : 5, max : 15}).withMessage('Room id length should be greater than 5 and less than 15 ')
    ],
    inputValidationMiddleware.validate, 
    getAllDeviceController.getAllDevice);



}