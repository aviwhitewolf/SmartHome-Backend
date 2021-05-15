const Joi = require('joi');

//Single Schema
const createRoomSingleSchema = Joi.object({
    roomName : Joi.string().trim().max(25).min(2).required(),
    homeId : Joi.string().trim().max(15).min(5).required()
})

const allRoomSingleSchema = Joi.object({
    homeId : Joi.string().trim().max(15).min(5).required()
})

const editRoomSingleSchema = Joi.object({
    roomId : Joi.string().trim().max(15).min(5).required(),
    homeId : Joi.string().trim().max(15).min(5).required(),
    roomName : Joi.string().trim().max(25).min(2).required()
})

module.exports = {
    createRoomSingleSchema,
    allRoomSingleSchema,
    editRoomSingleSchema
}
