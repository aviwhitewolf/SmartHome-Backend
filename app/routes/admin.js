const createAdminController = require("./../../app/controllers/admin/createAdmin").createAdmin;
const adminLoginController = require("./../../app/controllers/admin/login").login;
const adminLogoutController = require("./../../app/controllers/admin/logout").logout;
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
const inputValidationMiddleware = require('./../middlewares/inputValidation');
const {createSingleAdminSchema} = require('./../services/Validation/admin')
const {loginSingleSchema}  = require('./../services/Validation/user')



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/admin`;

    // create device
    app.post(`${baseUrl}/createAdmin`, auth.isAuthorized, inputValidationMiddleware.validation(createSingleAdminSchema),
    createAdminController);


    app.post(`${baseUrl}/login`, inputValidationMiddleware.validation(loginSingleSchema), adminLoginController);


    //logout
    app.post(`${baseUrl}/logout`, auth.isAuthorized, adminLogoutController);


}