const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
const inputValidationMiddleware = require('./../middlewares/inputValidation');
const { body } = require('express-validator');

const deleteRedisController = require('./../controllers/redis/deleteRedisEnteries')
const editRedisController = require('./../controllers/redis/editRedisEnteries')
const getAllRedisController = require('./../controllers/redis/getAllRedisEnteries')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/redis`;

    app.post(`${baseUrl}/getEnteries`, auth.isAuthorized,
        [
            body('*.hashName').isString().withMessage('Hash Name should be string')
        ],
        inputValidationMiddleware.validate,
        getAllRedisController.allEnteries);

    app.post(`${baseUrl}/deleteEnteries`, auth.isAuthorized,
        [
            body('*.hashName').isString().withMessage('Hash Name should be string'),
            body('*.key').isString().withMessage('keys should have string values'),
            body('*.type').isString().withMessage('Type should have string values')
        ],
        inputValidationMiddleware.validate,
        deleteRedisController.deleteEnteries);

}