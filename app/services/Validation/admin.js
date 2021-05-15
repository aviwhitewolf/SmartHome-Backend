const Joi = require('joi');


//Single Schema
const createSingleAdminSchema = Joi.object({
    firstName : Joi.string().trim().min(3).max(25).required(),
    LastName : Joi.string().trim().min(3).max(25).required(),
    email : Joi.string().email().required(),
    password : Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).min(3).max(255).required(),
    confirmPassword : Joi.ref('password'),
    mobileNumber : Joi.number().positive().greater(0).required(),
    country : Joi.string().trim().min(2).max(255).required(),
    rights : Joi.string().trim().trim().min(2).max(255).required(),
    level : Joi.number().integer().greater(0).less(4).required()
})

module.exports = {
    createSingleAdminSchema
}
