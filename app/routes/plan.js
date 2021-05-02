const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
const inputValidationMiddleware = require('./../middlewares/inputValidation');
const { body } = require('express-validator');

const allPlanController = require('./../controllers/plan/allPlan')
const createPlanController = require('./../controllers/plan/createPlan')
const editPlanController = require('./../controllers/plan/editPlan')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/plan`;

    app.post(`${baseUrl}/create`, auth.isAuthorized,
    [   
        body('description').isString().withMessage('Description should be string'),
        body('homeLimit').isInt({ ge: 0}).withMessage('Homelimit should be greater than 0'),
        body('deviceLimit').isInt({ ge: 0}).withMessage('Devicelimit should be greater than 0 per room'),
        body('requestPerDay').isInt({ ge: 0, le : 5000}).withMessage('Request per day should be between 0 - 5000'),
        body('price').isInt({ ge: 0 }).withMessage('Price should be greater than zero'),
        body('currency').isString().withMessage('Currency should be string'),
        body('planName').isString().withMessage('Plan name should be string'),
        body('toShow').isInt({ ge: 0 , le : 1}).withMessage('To show should be 0 or 1'),
        body('roomLimit').isInt({ ge: 0}).withMessage('Room Limit should be greater than 0 ')
    ],
    inputValidationMiddleware.validate,
    createPlanController.createPlan);


    app.post(`${baseUrl}/edit`, auth.isAuthorized,
    [   
        body('planId').isString().withMessage('Plan id should be string'),
        body('description').isString().withMessage('Description should be string'),
        body('homeLimit').isInt({ ge: 0}).withMessage('Homelimit should be between 1 to 100'),
        body('deviceLimit').isInt({ ge: 0}).withMessage('Devicelimit should be between 1 to 100 per room'),
        body('requestPerDay').isInt({ ge: 0, le : 5000}).withMessage('Request per day should be between 0 - 5000'),
        body('price').isInt({ ge: 0 }).withMessage('Price should be greater than zero'),
        body('currency').isString().withMessage('Currency should be string'),
        body('planName').isString().withMessage('Plan name should be string'),
        body('toShow').isInt({ ge: 0 , le : 1}).withMessage('To show should be 0 or 1'),
        body('roomLimit').isInt({ ge: 0}).withMessage('Room Limit should be greater than 0 ')
    ],
    inputValidationMiddleware.validate,
    editPlanController.editPlan);

    app.get(`${baseUrl}/all`, allPlanController.allPlan);

    
}