const { validationResult } = require('express-validator');
const response = require('./../libs/responseLib')

let inputValidation = (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    next()

}


let mInputValidation = (schema) => {
    return async (req, res, next) => {
        schema.validateAsync(req.body).then((data) => {
            next()
        }).catch((err) => {
            return res.status(422).json(response.generate(true, 'Invalid Data', 422, err.message));
        })
    }
}


module.exports = {

    validate: inputValidation,
    validation: mInputValidation
}