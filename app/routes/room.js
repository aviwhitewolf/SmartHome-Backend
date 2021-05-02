const express = require('express');
const router = express.Router();
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
const inputValidationMiddleware = require('./../middlewares/inputValidation');
const { body } = require('express-validator');

const createRoomController = require("./../../app/controllers/room/createRoom");
const editRoomController = require("./../../app/controllers/room/editRoom");
const getAllRoomController = require("./../../app/controllers/room/getAllRoom");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/room`;

    // create room
    app.post(`${baseUrl}/create`, auth.isAuthorized,
        [
            body('roomName').isString().withMessage('Room name should be string'),
            body('roomName').isLength({ min: 3, max: 25 }).withMessage('Room name length should be greater than 3 and less than 25 '),
            body('homeId').isString().withMessage('Home id should be string'),
            body('homeId').isLength({ min: 5, max: 15 }).withMessage('Home id length should be greater than 5 and less than 15 ')
        ],
        inputValidationMiddleware.validate,
        createRoomController.createRoom);

    //get all rooms

    app.get(`${baseUrl}/all`, auth.isAuthorized,
        [
            body('homeId').isString().withMessage('Home id should be string'),
            body('homeId').isLength({ min: 5, max: 15 }).withMessage('Home id length should be greater than 5 and less than 15 ')
        ],
        inputValidationMiddleware.validate,
        getAllRoomController.getAllRoom);


    // edit room
    app.put(`${baseUrl}/edit`, auth.isAuthorized,
        [
            body('roomId').isString().withMessage('Room id should be string'),
            body('roomId').isLength({ min: 5, max: 15 }).withMessage('Room id length should be greater than 5 and less than 15 '),
            body('roomName').isString().withMessage('Room name should be string'),
            body('roomName').isLength({ min: 3, max: 25 }).withMessage('Room name length should be greater than 3 and less than 25 '),
            body('homeId').isString().withMessage('Home id should be string'),
            body('homeId').isLength({ min: 5, max: 15 }).withMessage('Home id length should be greater than 5 and less than 15 '),
            // body('devices.*.deviceId').isString().withMessage('Device id should be string'),
            // body('devices.*.deviceId').isLength({min : 5, max : 15}).withMessage('Device id length should be greater than 5 and less than 15 '),
            // body('devices.*.deviceName').isString().withMessage('Device name should be string'),
            // body('devices.*.deviceName').isLength({min : 2, max : 25}).withMessage('Device name length should be greater than 3 and less than 25'),
            // body('devices.*.state').isInt({ge : 0, le : 1}).withMessage('State should be whole number 0 or 1'),
            // body('devices.*.voltage').isInt({ge : 0, le : 255}).withMessage('Voltage should be whole number between 0 to 255')
        ],
        inputValidationMiddleware.validate,
        editRoomController.editRoom);

}