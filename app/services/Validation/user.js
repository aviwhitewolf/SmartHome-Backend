const Joi = require('joi');
const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,255}$/;

//Single Schema
const loginSingleSchema = Joi.object({
    email : Joi.string().email().required(),
    password : Joi.string().regex(pattern).required()
})

//Minimum eight characters, at least one letter, one number and one special character:
const createSingleUserSchema = Joi.object({
    firstName : Joi.string().trim().min(3).max(25).required(),
    lastName : Joi.string().trim().min(3).max(25).required(),
    email : Joi.string().email().required(),
    password : Joi.string().regex(pattern).required(),
    confirmPassword : Joi.ref('password'),
    mobileNumber : Joi.number().integer().min(0).required(),
    country : Joi.string().trim().min(2).max(255).required()
}).with('password', 'confirmPassword')

const editSingleUserSchema = Joi.object({
    firstName : Joi.string().trim().min(3).max(25).required(),
    lastName : Joi.string().trim().min(3).max(25).required(),
    email : Joi.string().email().required(),
    mobileNumber : Joi.number().integer().min(0).required(),
    country : Joi.string().trim().min(2).max(255).required()
})


module.exports = {
    loginSingleSchema,
    createSingleUserSchema,
    editSingleUserSchema 
}
