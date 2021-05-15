const Joi = require('joi');

//Single Schema
const singleDeviceCreateSchema = Joi.object({
        deviceName : Joi.string().trim().max(25).min(2).required(),
        state : Joi.number().greater(-1).less(3).default(0),
        voltage : Joi.number().greater(-1).less(256).default(0),
        extra : Joi.string().trim().max(1000).default('')
})

const singleDeviceEditSchema = Joi.object({
        deviceId : Joi.string().trim().max(15).min(5).required(),
        deviceName : Joi.string().trim().max(25).min(2).required(),
        state : Joi.number().greater(-1).less(3).default(0),
        voltage : Joi.number().greater(-1).less(256).default(0),
        extra : Joi.string().trim().max(1000).default('')
})

const singleDeviceInfoSchema = Joi.object({
        deviceId : Joi.string().trim().max(15).min(5).required(),
        roomId : Joi.string().trim().max(15).min(5).required()
})

//Multiple Schema
const createDeviceSchema = Joi.object({
        homeId : Joi.string().trim().max(15).min(5).required(),
        roomId : Joi.string().trim().max(15).min(5).required(),
        devices : Joi.array().required().items(singleDeviceCreateSchema)    
})

const editDeviceSchema = Joi.object({
        homeId : Joi.string().trim().max(15).min(5).required(),
        roomId : Joi.string().trim().max(15).min(5).required(),
        devices : Joi.array().required().items(singleDeviceEditSchema)    
})

module.exports = {
    createDeviceSchema ,
    singleDeviceCreateSchema,
    editDeviceSchema,
    singleDeviceInfoSchema
}



