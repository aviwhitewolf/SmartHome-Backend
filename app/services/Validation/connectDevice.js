const Joi = require('joi');

//Single Schema
const connectDeviceSingleSchema = Joi.object({
    deviceId : Joi.string().trim().min(5).max(15).required(),
    deviceName : Joi.string().trim().min(2).max(25).required(),
    state : Joi.number().integer().greater(-1).less(2).required(),
    voltage : Joi.number().integer().greater(-1).less(256).required(),
    extra : Joi.string().trim().optional(),
    value : Joi.string().trim().optional()
})

const connectDeviceSchema = Joi.object({
    socketId : Joi.string().optional(),
    userId : Joi.string().optional(),
    authToken : Joi.string().trim().min(1).required(),
    homeId : Joi.string().trim().max(15).min(5).required(),
    roomId : Joi.string().trim().max(15).min(5).required(),
    type : Joi.string().trim().max(1).min(1).required(),
    devices : Joi.array().items(connectDeviceSingleSchema)
})


module.exports = {
    connectDeviceSchema
}
