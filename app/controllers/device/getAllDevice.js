const mongoose = require('mongoose');
const response = require('./../../libs/responseLib')
const logger = require('./../../libs/loggerLib');
const check = require('../../libs/checkLib');

const RoomModel = mongoose.model('Room')

//get single device function
let getAllDeviceFunction = (req, res) => {

    try {

        RoomModel.aggregate([
            {
                $lookup:
                {
                    from: "devices",
                    let: { roomId: "$roomId", homeId: "$homeId" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: ["$roomId", "$$roomId"] },
                                            { $eq: ["$homeId", "$$homeId"] },
                                            { $eq: ["$homeId", req.body.homeId] }
                                        ]
                                }
                            }
                        },
                        { $project: { _id: 0, userId: 0, __v: 0, lastModified: 0, createdOn: 0 } }
                    ],
                    as: "devices"
                }
            }
        ])
            .match({ roomId: req.body.roomId })
            .project({ userId: 0, _id: 0, lastModified: 0, createdOn: 0, __v: 0 })
            .exec((err, result) => {

                if (err) {

                    logger.error(err.message, 'Device Controller: getAllDevice', 10, err)
                    let apiResponse = response.generate(true, 'Failed to find devices ', 500, null)
                    res.status(apiResponse.status).send(apiResponse)

                } else if (check.isEmpty(result)) {

                    logger.info('No device found', 'Device Controller : getAllDeviceDevice', 1)
                    let apiResponse = response.generate(true, 'No Device Found', 404, null)
                    res.status(apiResponse.status).send(apiResponse)

                } else {

                    let apiResponse = response.generate(false, 'Device found', 200, result);
                    res.status(apiResponse.status).send(apiResponse)

                }
            })

    } catch (err) {

        logger.error('Internal server Error', 'Device Controller: getAllDeviceFunction', 10, err)
        let apiResponse = response.generate(true, 'Internal server error', 500, null)
        res.status(apiResponse.status).send(apiResponse)

    }

}

module.exports = {
    getAllDevice: getAllDeviceFunction
}