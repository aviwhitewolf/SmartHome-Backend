const express = require('express');
const router = express.Router();
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
const inputValidationMiddleware = require('./../middlewares/inputValidation')

const createRoomController = require("./../../app/controllers/room/createRoom").createRoom
const editRoomController = require("./../../app/controllers/room/editRoom").editRoom
const getAllRoomController = require("./../../app/controllers/room/getAllRoom").getAllRoom
const { createRoomSingleSchema,allRoomSingleSchema,editRoomSingleSchema } = require('./../services/Validation/room')



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/room`;

    app.post(`${baseUrl}/create`, auth.isAuthorized, inputValidationMiddleware.validation(createRoomSingleSchema), createRoomController);

    app.get(`${baseUrl}/all`, auth.isAuthorized, inputValidationMiddleware.validation(allRoomSingleSchema), getAllRoomController);

    app.put(`${baseUrl}/edit`, auth.isAuthorized, inputValidationMiddleware.validation(editRoomSingleSchema), editRoomController);

}