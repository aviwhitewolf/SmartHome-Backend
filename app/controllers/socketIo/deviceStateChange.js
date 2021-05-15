const mongoose = require('mongoose');
const logger = require('../../libs/loggerLib.js');
const time = require('../../libs/timeLib');
const config = require('../../config/config')
const tokenLib = require("../../libs/tokenLib.js");
const check = require("../../libs/checkLib.js");
const response = require('../../libs/responseLib');

// const eventEmitter = new events.EventEmitter();

const Redis = require("ioredis");
const redis = new Redis();

/*

* For Highlighted text
! For Errors
? Answers and questions

*/

const deviceHashName = config.constants.ConnectedDevice;
const userHashName = config.constants.ConnectedUser;

let deviceStateChange = (data) => {

    try {

        let arrayToUpdate = []
        data.devices.forEach((device, index) => {

            arrayToUpdate.push(
                ["hmset", deviceHashName, `${device.deviceId}.state`, device.state],
                ["hmset", deviceHashName, `${device.deviceId}.voltage`, device.voltage],
                ["hmset", deviceHashName, `${device.deviceId}.extra`, device.extra],
            )

            if (index == data.devices - 1) {

                redis
                    .pipeline(arrayToUpdate)
                    .exec((err, result) => {

                        if (err) {

                            return reject(response.generate(true, 'Unable to update data to realtime database', 500, null))

                        } else if (!check.isEmpty(result[0][1][0])
                            && !check.isEmpty(result[1][1][0])
                            && !check.isEmpty(result[2][1][0])) {

                            return resolve(data)

                        } else {

                            return reject(response.generate(true, 'Unable to update data to realtime database', 500, null))

                        }
                    })

            }

        });


    } catch (err) {

        logger.error('Internal server Error', 'socketLib : services : socketIo : deviceStateChange', 10, err)
        reject(response.generate(true, 'Internal server error', 500, null))

    }

}


module.exports = {
    deviceStateChange: deviceStateChange
}