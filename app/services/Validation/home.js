const Joi = require('joi');

//Single Schema
const createHomeSingleSchema = Joi.object({
    homeName : Joi.string().trim().max(25).min(2).required(),
    lat : Joi.number().optional(),
    lng : Joi.number().optional()
}).with('lat', 'lng').with('lng', 'lat')

const editHomeSingleSchema = Joi.object({
    homeName : Joi.string().trim().max(25).min(2).required(),
    homeId : Joi.string().trim().max(15).min(5).required(),
    lat : Joi.number().optional(),
    lng : Joi.number().optional()
}).with('lat', 'lng').with('lng', 'lat')

const homeInfoSingleSchema = Joi.object({
    homeId : Joi.string().trim().max(15).min(5).required()
})

module.exports = {
    createHomeSingleSchema,
    editHomeSingleSchema,
    homeInfoSingleSchema
}
