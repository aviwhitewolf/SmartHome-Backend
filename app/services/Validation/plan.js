const Joi = require('joi');

//Single Schema
const createPlanSingleSchema = Joi.object({
    description : Joi.string().trim().min(3).max(255).required(),
    connectedHomeLimit : Joi.number().positive(). required(),
    connectedRoomLimit : Joi.number().positive().required(),
    connectedDeviceLimit : Joi.number().positive().required(),
    requestPerDayLimit   : Joi.number().positive().required(),
    price : Joi.number().positive().required(),
    currency :Joi.string().min(3).max(5).required(),
    planName :Joi.string().trim().min(3).max(15).required(),
    toShow : Joi.number().positive().less(3)
})

const editPlanSingleSchema = Joi.object({
    planId : Joi.string().trim().max(15).min(5).required(),
    description : Joi.string().trim().min(3).max(255).required(),
    connectedHomeLimit : Joi.number().positive(). required(),
    connectedRoomLimit : Joi.number().positive().required(),
    connectedDeviceLimit : Joi.number().positive().required(),
    requestPerDayLimit   : Joi.number().positive().required(),
    price : Joi.number().positive().required(),
    currency :Joi.string().min(3).max(5).required(),
    planName :Joi.string().trim().min(3).max(15).required(),
    toShow : Joi.number().positive().less(3)
})


module.exports = {
    createPlanSingleSchema,
    editPlanSingleSchema
}
