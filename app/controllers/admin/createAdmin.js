const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../../libs/timeLib');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const passwordLib   = require('./../../libs/generatePasswordLib');

/* Models */
const AdminModel = mongoose.model('Admin')

let createAdminFunction = (req, res) => {

    //check if person is authorised to add admin, proper rights
    let checkAuthorization = () => {

        return new Promise((resolve, reject) => {

            try {

                if (req.hasOwnProperty('result') && req.result.level === 1) {
                    
                    if(req.result.email === req.body.email.toLowerCase())
                    {

                    logger.error("Admin already exists", 'adminController: checkAuthorization()', 1)
                    let apiResponse = response.generate(true, 'Admin already present with this email', 403, null)
                    reject(apiResponse)


                    }else{
                     
                        resolve()
                    
                    }
                    
                } else {

                    logger.error("Admin can not be created. Admin don't have proper rights", 'adminController: checkAuthorization', 1)
                    let apiResponse = response.generate(true, "Admin don't have proper rights", 403, null)
                    reject(apiResponse)

                }            

            } catch (err) {


                logger.error('Internal server Error', 'Admin Controller: checkAuthorization', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)


            }

        })

    }

    //add admin
    let createAdmin = () => {

        return new Promise((resolve, reject) => {

            try {

                let newAdmin = new AdminModel({
                    adminId: shortid.generate(),
                    firstName: req.body.firstName,
                    lastName: req.body.lastName || '',
                    email: req.body.email.toLowerCase(),
                    mobileNumber: req.body.mobileNumber,
                    password: passwordLib.hashpassword(req.body.password),
                    country: req.body.country,
                    level: 5,
                    rights: req.body.rights,
                    createdOn: time.now(),
                    createdBy: req.user.adminId,
                    lastModifiedBy: req.user.adminId,
                    lastModified: time.now(),
                })

                newAdmin.save((err, createdAdmin) => {

                    if (err) {

                        logger.error(err.message, 'adminController: createAdmin', 10, err)
                        let apiResponse = response.generate(true, 'Failed to create new admin', 500, null)
                        reject(apiResponse)

                    } else {

                        let newUserObj = createdAdmin.toObject();
                        
                        delete newUserObj.__v
                        delete newUserObj._id
                        delete newUserObj.adminId
                        delete newUserObj.password
                        delete newUserObj.level
                        delete newUserObj.rights
                        delete newUserObj.createdBy
                        delete newUserObj.lastModifiedBy
                        delete newUserObj.lastModified
                        delete newUserObj.createdOn
                        delete newUserObj.isDelete
                        delete newUserObj.isDeleteBy

                        resolve(newUserObj)

                    }
                })

            } catch (err) {

                logger.error('Internal server Error', 'Admin Controller: createAdmin', 10, err)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                reject(apiResponse)

            }

        })

    }

    checkAuthorization(req, res)
        .then(createAdmin)
        .then((resolve) => {

            let apiResponse = response.generate(false, 'New Admin created successfully', 200, resolve);
            res.status(apiResponse.status).send(apiResponse)

        })
        .catch((err) => {
            res.status(err.status).send(err);
        })

}//end home creation function


module.exports = {
    createAdmin : createAdminFunction
}// end exports
