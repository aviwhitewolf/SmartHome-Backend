const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
const inputValidationMiddleware = require('./../middlewares/inputValidation');

const allPlanController = require('./../controllers/plan/allPlan').allPlan
const createPlanController = require('./../controllers/plan/createPlan').createPlan
const editPlanController = require('./../controllers/plan/editPlan').editPlan
const { createPlanSingleSchema, editPlanSingleSchema} = require('./../services/Validation/plan')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/plan`;

    app.post(`${baseUrl}/create`, auth.isAuthorized, inputValidationMiddleware.validation(createPlanSingleSchema), createPlanController);

    app.post(`${baseUrl}/edit`, auth.isAuthorized, inputValidationMiddleware.validation(editPlanSingleSchema), editPlanController);

    app.get(`${baseUrl}/all`,auth.isAuthorized, allPlanController);

    
}