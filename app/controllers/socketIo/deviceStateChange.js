const logger = require('../../libs/loggerLib.js');
const config = require('../../config/config')
const check = require("../../libs/checkLib.js");
const response = require('../../libs/responseLib');
const { isEmpty } = require('../../libs/checkLib.js');
// const eventEmitter = new events.EventEmitter();

const Redis = require("ioredis");
const redis = new Redis();

/*

* For Highlighted text
! For Errors
? Answers and questions

*/

const deviceHashName = config.constants.ConnectedDevice;

let deviceStateChange = (data) => {

    return new Promise((resolve, reject) => {

    try {

        let arrayToUpdate = []
        data.devices.forEach((device, index) => {

            arrayToUpdate.push(
                ["hmset", deviceHashName, `${device.deviceId}.state`, device.state],
                ["hmset", deviceHashName, `${device.deviceId}.voltage`, device.voltage],
            )

            if(!isEmpty(device.extra)) 
                arrayToUpdate.push(["hmset", deviceHashName, `${device.deviceId}.extra`, device.extra])

            if(!isEmpty(device.value))
                arrayToUpdate.push(["hmset", deviceHashName, `${device.deviceId}.value`, device.value])    

            if (index == data.devices.length - 1) {

                redis
                    .pipeline(arrayToUpdate)
                    .exec((err, result) => {

                        if (err) {

                            return reject(response.generate(true, 'Unable to update data to realtime database', 500, null))

                        } else if (!check.isEmpty(result[0][1]) && !check.isEmpty(result[1][1])) {

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

})

}


module.exports = {
    deviceStateChange: deviceStateChange
}