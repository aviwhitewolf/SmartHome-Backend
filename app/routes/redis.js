const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
const inputValidationMiddleware = require('./../middlewares/inputValidation');

const deleteRedisController = require('./../controllers/redis/deleteRedisEnteries').deleteEnteries
const editRedisController = require('./../controllers/redis/editRedisEnteries').editEntries
const getAllRedisController = require('./../controllers/redis/getAllRedisEnteries').allEnteries
const {getEnteriesSchema ,deleteEnteriesSchema} = require('./../services/Validation/redis')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/redis`;

    app.post(`${baseUrl}/getEnteries`, auth.isAuthorized,
        inputValidationMiddleware.validation(getEnteriesSchema), getAllRedisController);

    app.post(`${baseUrl}/deleteEnteries`, auth.isAuthorized, 
    inputValidationMiddleware.validation(deleteEnteriesSchema), deleteRedisController);

}