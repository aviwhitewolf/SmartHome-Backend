const Joi = require('joi');

//Single Schema
const loginSingleSchema = Joi.object({
    email : Joi.string().email().required(),
    password : Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).min(3).max(255).required()
})

const createSingleUserSchema = Joi.object({
    firstName : Joi.string().trim().min(3).max(25).required(),
    LastName : Joi.string().trim().min(3).max(25).required(),
    email : Joi.string().email().required(),
    password : Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).min(3).max(255).required(),
    confirmPassword : Joi.ref('password'),
    mobileNumber : Joi.number().integer().min(0).required(),
    country : Joi.string().trim().min(2).max(255).required()
})

const editSingleUserSchema = Joi.object({
    firstName : Joi.string().trim().min(3).max(25).required(),
    LastName : Joi.string().trim().min(3).max(25).required(),
    email : Joi.string().email().required(),
    mobileNumber : Joi.number().integer().min(0).required(),
    country : Joi.string().trim().min(2).max(255).required()
})


module.exports = {
    loginSingleSchema,
    createSingleUserSchema,
    editSingleUserSchema 
}
