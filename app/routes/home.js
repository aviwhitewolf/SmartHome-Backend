const express                   = require('express');
const router                    = express.Router();
const createHomeController      = require("./../../app/controllers/home/createHome").createHome;
const editSingleHomeController  = require("./../../app/controllers/home/editSingleHome").editHome;
const getSingleHomeController   = require("./../../app/controllers/home/getSingleHome").getHome;
const getHomeListController     = require("./../../app/controllers/home/getHomeList").getHomeList;
const appConfig                 = require("./../../config/appConfig")
const authMiddleware            = require('./../middlewares/auth')
const inputValidationMiddleware = require('./../middlewares/inputValidation');
const {  createHomeSingleSchema,editHomeSingleSchema ,homeInfoSingleSchema } = require('./../services/Validation/home')


module.exports.setRouter = (app) => {

   let baseUrl = `${appConfig.apiVersion}/home`;

   //to create home 
   app.post(`${baseUrl}/create`,authMiddleware.isAuthorized, inputValidationMiddleware.validation(createHomeSingleSchema), 
   createHomeController);
    
   // edit home
   app.put(`${baseUrl}/edit`, authMiddleware.isAuthorized, inputValidationMiddleware.validation(editHomeSingleSchema),
   editSingleHomeController);

   //home info
   app.get(`${baseUrl}/info`,authMiddleware.isAuthorized, inputValidationMiddleware.validation(homeInfoSingleSchema),
   getSingleHomeController);

   //home list
   app.get(`${baseUrl}/list`,authMiddleware.isAuthorized, getHomeListController);


}