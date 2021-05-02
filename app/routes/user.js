const express = require('express');
const router = express.Router();
const appConfig = require("./../../config/appConfig")
const authMiddleware = require('./../middlewares/auth')
const inputValidationMiddleware = require('./../middlewares/inputValidation');
const { body } = require('express-validator');

const editUserController = require("./../../app/controllers/user/editUser");
const getSingleUserController = require("./../../app/controllers/user/getSingleUser");
const loginUserController = require("./../../app/controllers/user/loginFunction");
const logoutUserController = require("./../../app/controllers/user/logoutFunction");
const signUpUserController = require("./../../app/controllers/user/signUp");


module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/user`;

    //signup
    app.post(`${baseUrl}/signup`,
        [
            body('firstName').isString().withMessage('First name should be string'),
            body('firstName').isLength({ min: 3, max: 25 }).withMessage('First name length should be greater than 3 and less than 25 '),
            body('lastName').isString().withMessage('Last name should be string'),
            body('lastName').isLength({ min: 3, max: 25 }).withMessage('Last name length should be greater than 3 and less than 25 '),
            body('email').isEmail().withMessage('Invalid Email'),
            body('password').isString().withMessage('password should be string'),
            body('password').isLength({ min: 3, max: 255 }).withMessage('password length should be greater than 3 and less than 25 '),
            body('mobileNumber').isMobilePhone().withMessage('Invaid mobile number'),
            body('country').isString().withMessage('Country is invalid'),
        ],
        inputValidationMiddleware.validate,
        signUpUserController.signUpFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login api for user login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
                "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
                "userDetails": {
                "mobileNumber": 2234435524,
                "email": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
            }

        }
    */

    //user login
    app.post(`${baseUrl}/login`,
        [
            body('email').isEmail().withMessage('Invalid email'),
            body('password').isString().withMessage('Invalid password'),
        ],
        inputValidationMiddleware.validate,
        loginUserController.loginFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/logout to logout user.
     *
     * @apiParam {string} userId userId of the user. (auth headers) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Logged Out Successfully",
            "status": 200,
            "data": null

        }
    */

    //edit User
    app.post(`${baseUrl}/edit`, authMiddleware.isAuthorized,
        [
            body('firstName').isString().withMessage('First name should be string'),
            body('firstName').isLength({ min: 3, max: 25 }).withMessage('First name length should be greater than 3 and less than 25 '),
            body('lastName').isString().withMessage('Last name should be string'),
            body('lastName').isLength({ min: 3, max: 25 }).withMessage('Last name length should be greater than 3 and less than 25 '),
            body('mobileNumber').isMobilePhone().withMessage('Invaid mobile number'),
            body('country').isString().withMessage('Country is invalid')
        ],
        inputValidationMiddleware.validate,
        editUserController.editUser);


    //User Info
    app.get(`${baseUrl}/info`, authMiddleware.isAuthorized, getSingleUserController.getSingleUser);

    //logout
    app.post(`${baseUrl}/logout`, authMiddleware.isAuthorized, logoutUserController.logout);

}
