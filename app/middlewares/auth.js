const mongoose    = require('mongoose')
const logger      = require('./../libs/loggerLib')
const responseLib = require('./../libs/responseLib')
const token       = require('./../libs/tokenLib')
const check       = require('./../libs/checkLib')


const AdminModel  = mongoose.model('Admin')
const Auth        = mongoose.model('Auth')
const UserModel   = mongoose.model('User')

let isAuthorized = (req, res, next) => {

  //verifying user Token


  let tokenVerification = () => {

    return new Promise((resolve, reject) => {

    try {
        
      if (req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')) {
      
        Auth.findOne({ authToken: req.header('authToken') || req.params.authToken || req.body.authToken || req.query.authToken }, (err, authDetails) => {
      
          if (err) {
      
            logger.error(err.message, 'AuthorizationMiddleware', 10, err)
            let apiResponse = responseLib.generate(true, 'Failed To Authorized', 500, null)
            reject(apiResponse)
      
          } else if (check.isEmpty(authDetails)) {
      
            logger.error('No AuthorizationKey Is Present', 'AuthorizationMiddleware', 2)
            let apiResponse = responseLib.generate(true, 'Invalid Or Expired AuthorizationKey', 404, null)
            reject(apiResponse)
      
          } else {
      
            token.verifyToken(authDetails.authToken, authDetails.tokenSecret, (err, decoded) => {
      
              if (err) {
      
                logger.error(err.message, 'Authorization Middleware', 10, err)
                let apiResponse = responseLib.generate(true, 'Failed To Authorized', 500, null)
                reject(apiResponse)
      
              }
      
              else {

                if(decoded.data.userId != undefined && decoded.data.userId != null && decoded.data.userId != '')
                {
                  req.user = { userId: decoded.data.userId }
                  resolve(req)
                }
                else if(decoded.data.adminId != undefined && decoded.data.adminId != null && decoded.data.adminId != '')
                {
                  req.user = { adminId: decoded.data.adminId }
                  resolve(req)
                
                }else {

                  logger.error(err.message, 'Authorization Middleware', 10, err)
                  let apiResponse = responseLib.generate(true, 'Failed To Authorized', 500, null)
                  reject(apiResponse)


                }

              }
      
            });// end verify token

          }
        })
     
      } else {
      
        logger.error('AuthorizationToken Missing', 'AuthorizationMiddleware', 2)
        let apiResponse = responseLib.generate(true, 'AuthorizationToken Is Missing In Request', 400, null)
        reject(apiResponse)
      
      }


    } catch (err) {
      
      logger.error('Internal server Error', 'Auth Middleware: tokenVerification()', 10, err)
      let apiResponse = response.generate(true, 'Internal server error', 500, null)
      reject(apiResponse)

    }


    })

  }// end verifying user token

  let verifyUser = () => {
    
    return new Promise((resolve, reject) => {
     
    try {

      if(req.user.userId != undefined && req.user.userId != null && req.user.userId != '')
      {

        UserModel.findOne({ 'userId': req.user.userId })
        .select('-password -__v -_id')
        .lean()
        .exec((err, result) => {
  
          console.log(result)
  
            if (err) {
         
                logger.error(err.message, 'Middleware: getSingleUser', 10, err)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                reject(apiResponse)
         
              } else if (check.isEmpty(result)) {
           
                logger.info('No User Found', 'Middleware:getSingleUser', 1)
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                reject(apiResponse)
           
              } else {
           
                resolve()
           
              }
        })
    
        
      }

      else if(req.user.adminId != undefined && req.user.adminId != null && req.user.adminId != '')
      {
        AdminModel.findOne({ adminId: req.user.adminId })
        .exec((err, result) => {

          if (err) {

            logger.error(err.message, 'authMiddleware: verfiyUser()', 10, err)
            let apiResponse = response.generate(true, 'Failed to find admin', 500, null)
            reject(apiResponse)

          } else if (check.isEmpty(result)) {

            logger.info('No admin found', 'authMiddleware: verfiyUser()', 1)
            let apiResponse = response.generate(true, 'No admin found', 404, null)
            reject(apiResponse)

          } else {
              req.result = result
              resolve()
          }

        })

      }else {
        
        logger.info('Not a user nor admin', 'authMiddleware: verfiyUser()', 10)
        let apiResponse = response.generate(true, 'Not a proper input of user', 406, null)
        reject(apiResponse)

      }


    } catch (err) {
        
      logger.error('Internal server Error', 'Auth Middleware: tokenVerification()', 10, err)
      let apiResponse = response.generate(true, 'Internal server error', 500, null)
      reject(apiResponse)

    }
    
    })

  } //end user verification

  tokenVerification(req, res, next)
    .then(verifyUser)
    .then((resolve) => {
      next()
    })
    .catch((err) => {
    
      res.status(err.status).send(err);
    
    })
}

module.exports = {
  isAuthorized: isAuthorized
}
