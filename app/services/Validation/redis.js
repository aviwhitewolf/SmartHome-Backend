const Joi = require('joi');

const getEnteriesSchema = Joi.array().required().items(Joi.object({
    hashName : Joi.string().trim().min(3).max(25).required()
}))

const deleteEnteriesSchema = Joi.array().required().items(Joi.object({
    hashName : Joi.string().trim().min(3).max(25).required(),
    key : Joi.string().trim().min(3).max(25).required(),
    type : Joi.string().trim().min(3).max(25).required()
}))


module.exports = {
    getEnteriesSchema,
    deleteEnteriesSchema
}
