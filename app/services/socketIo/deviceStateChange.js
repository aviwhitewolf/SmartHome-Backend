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

        
        
    } catch (err) {
        
        logger.error('Internal server Error', 'socketLib : services : socketIo : deviceStateChange', 10, err)
        reject(response.generate(true, 'Internal server error', 500, null))

    }

}


module.exports = {
    deviceStateChange : deviceStateChange
}