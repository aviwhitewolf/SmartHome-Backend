const createAdminController = require("./../../app/controllers/admin/createAdmin");
const adminLoginController = require("./../../app/controllers/admin/login");
const adminLogoutController = require("./../../app/controllers/admin/logout");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
const inputValidationMiddleware = require('./../middlewares/inputValidation');
const { body } = require('express-validator');



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/admin`;

    // create device
    app.post(`${baseUrl}/createAdmin`, auth.isAuthorized,
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
                body('rights').isString().withMessage('Rights should be string'),
                body('level').isInt({ ge: 1, le: 3 }).withMessage('Level should be whole number between 1 to 3')
            ],
            inputValidationMiddleware.validate,
            createAdminController.createAdmin);


    app.post(`${baseUrl}/login`,
        [
            body('email').isEmail().withMessage('Invalid email'),
            body('password').isString().withMessage('Invalid password')
        ],
        inputValidationMiddleware.validate,
        adminLoginController.login);


    //logout
    app.post(`${baseUrl}/logout`, auth.isAuthorized, adminLogoutController.logout);


}