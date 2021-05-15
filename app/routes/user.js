const express = require('express');
const router = express.Router();
const appConfig = require("./../../config/appConfig")
const authMiddleware = require('./../middlewares/auth')
const inputValidationMiddleware = require('./../middlewares/inputValidation');

const editUserController = require("./../../app/controllers/user/editUser").editUser
const getSingleUserController = require("./../../app/controllers/user/getSingleUser").getSingleUser
const loginUserController = require("./../../app/controllers/user/loginFunction").loginFunction
const logoutUserController = require("./../../app/controllers/user/logoutFunction").logout
const signUpUserController = require("./../../app/controllers/user/signUp").signUpFunction
const {loginSingleSchema, createSingleUserSchema, editSingleUserSchema } = require('./../services/Validation/user')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/user`;

    app.post(`${baseUrl}/signup`, inputValidationMiddleware.validation(createSingleUserSchema), signUpUserController);

    app.post(`${baseUrl}/login`, inputValidationMiddleware.validation(loginSingleSchema), loginUserController);

    app.post(`${baseUrl}/edit`, authMiddleware.isAuthorized, inputValidationMiddleware.validation(editSingleUserSchema), editUserController);

    app.get(`${baseUrl}/info`, authMiddleware.isAuthorized, getSingleUserController);

    app.post(`${baseUrl}/logout`, authMiddleware.isAuthorized, logoutUserController);

}
