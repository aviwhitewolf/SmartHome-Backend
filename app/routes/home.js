const express                   = require('express');
const router                    = express.Router();
const createHomeController      = require("./../../app/controllers/home/createHome");
const editSingleHomeController  = require("./../../app/controllers/home/editSingleHome");
const getSingleHomeController   = require("./../../app/controllers/home/getSingleHome");
const getHomeListController     = require("./../../app/controllers/home/getHomeList");
const appConfig                 = require("./../../config/appConfig")
const authMiddleware            = require('./../middlewares/auth')
const inputValidationMiddleware = require('./../middlewares/inputValidation');
const { body}                   = require('express-validator');


module.exports.setRouter = (app) => {

   let baseUrl = `${appConfig.apiVersion}/home`;

   //to create home 
   app.post(`${baseUrl}/create`,authMiddleware.isAuthorized, 
   [
    body('homeName').notEmpty().withMessage('Home name is empty'),
    body('homeName').isString().withMessage('Home name should be string'),
    body('homeName').isLength({min : 3, max : 25}).withMessage('Home name length should be greater than 3 and less than 25 '),
   ], 
   inputValidationMiddleware.validate, 
   createHomeController.createHome);
    
   // edit home
   app.put(`${baseUrl}/edit`, authMiddleware.isAuthorized,
   [
    body('homeId').isString().withMessage('Home id should be string'),
    body('homeId').isLength({min : 5, max : 15}).withMessage('Home id length should be greater than 5 and less than 15 '),   
    body('homeName').notEmpty().withMessage('Home name is empty'),
    body('homeName').isString().withMessage('Home name should be string'),
    body('homeName').isLength({min : 3, max : 25}).withMessage('Home name length should be greater than 3 and less than 25 ')
   ],
   inputValidationMiddleware.validate,
   editSingleHomeController.editHome);

   //home info
   app.get(`${baseUrl}/info`,authMiddleware.isAuthorized, 
   [
    body('homeId').notEmpty().withMessage('Home id is empty'),
    body('homeId').isString().withMessage('Home id should be string'),
    body('homeId').isLength({min : 5, max : 15}).withMessage('Home id length should be greater than 5 and less than 15 '),   
   ],
   inputValidationMiddleware.validate,
   getSingleHomeController.getHome);

   //home list
   app.get(`${baseUrl}/list`,authMiddleware.isAuthorized, getHomeListController.getHomeList);


}