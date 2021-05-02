const mongoose = require('mongoose');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib')
const RoomModel = mongoose.model('Room')

//get all rooms
let getAllRoomsFunction = (req, res) => {

    try {

        RoomModel.find({ 'userId': req.user.userId, 'homeId': req.body.homeId })
            .select('-__v -_id -userId -lastModified -createdOn')
            .lean()
            .exec((err, result) => {

                if (err) {

                    logger.error(err.message, ' roomController : getAllRooms()', 10, err)
                    let apiResponse = response.generate(true, 'Failed to find room details', 500, null)
                    res.status(apiResponse.status).send(apiResponse)

                } else if (check.isEmpty(result)) {

                    logger.info('No room found', 'roomController : getAllRooms()', 1)
                    let apiResponse = response.generate(true, 'No room found', 404, null)
                    res.status(apiResponse.status).send(apiResponse)

                } else {

                    let apiResponse = response.generate(false, 'Rooms found', 200, result);
                    res.status(apiResponse.status).send(apiResponse)

                }
            })

    } catch (err) {

        logger.error('Internal server Error', 'roomController : getAllRooms() ', 10, err)
        let apiResponse = response.generate(true, 'Internal server error', 500, null)
        res.status(apiResponse.status).send(apiResponse)

    }

}//get all rooms end

module.exports = {
    getAllRoom: getAllRoomsFunction
}// end exports