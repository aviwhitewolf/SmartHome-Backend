const response = require('./../libs/responseLib')
const logger   = require('../libs/loggerLib')


let errorHandler = (err,req, res, next) => {
    logger.error("Application error handler called", "appErrorHandler.js : errorHandler()", 10, err)

    let apiResponse = response.generate(true, 'Some error occured at global level',500, null)
    res.status(apiResponse.status).send(apiResponse)
    
}// end request ip logger function 

let notFoundHandler = (req,res,next)=>{


    logger.error("Global not found handler called", "appErrorHandler.js : notFoundHandler()", 10)
    let apiResponse = response.generate(true, 'Route not found in the application',404, null)
    res.status(apiResponse.status).send(apiResponse)

}// end not found handler

module.exports = {
    globalErrorHandler : errorHandler,
    globalNotFoundHandler : notFoundHandler
}
