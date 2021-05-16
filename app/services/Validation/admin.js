const Joi = require('joi');


//Single Schema
const createSingleAdminSchema = Joi.object({
    firstName : Joi.string().trim().min(3).max(25).required(),
    lastName : Joi.string().trim().min(3).max(25).required(),
    email : Joi.string().email().required(),
    password : Joi.string().pattern(new RegExp('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[]:;<>,.?/~_+-=|\]).{3,50}$')).min(3).max(255).required(),
    confirmPassword : Joi.ref('password'),
    mobileNumber : Joi.number().positive().greater(0).required(),
    country : Joi.string().trim().min(2).max(255).required(),
    rights : Joi.string().trim().trim().min(2).max(255).required(),
    level : Joi.number().integer().greater(0).less(4).required()
})

module.exports = {
    createSingleAdminSchema
}
