//redis lib
const check = require("./checkLib.js");
const redis = require('redis');
let client = redis.createClient();
const logger = require('../libs/loggerLib');

client.on('connect', () => {

    // console.info("Redis connection successfully opened");
    logger.info("Redis connection successfully opened", "redisLib.js : client.on()", 1)

});

let getAllDataFromHash = (hashName, callback) => {

    client.HGETALL(hashName, (err, result) => {

        if (err) {

            
            logger.error("Error while fetching data from Hash : "+ hashName, "redisLib.js : getAllDataFromHash()", 10, err)
            callback(err, null)

        } else if (check.isEmpty(result)) {

            logger.error("Redis List is Empty for : " + hashName, "redisLib.js : getAllDataFromHash()", 10, err)

            callback(null, {})

        } else {

            callback(null, result)

        }
    });


}// end get all users in a hash

let getDataFromHash = (hashName, key, callback) => {

    client.HGET(hashName, key, (err, result) => {

        if (err) {

            logger.error("Error while fetching data from Hash : "+ hashName + "and key: " + key,
             "redisLib.js : getDataFromHash()", 10, err)
            callback(err, null)

        } else if (check.isEmpty(result)) {

            logger.error("List is Empty: "+ hashName + "and key: " + key,
            "redisLib.js : getDataFromHash()", 10, err)
            callback(null, {})

        } else {
            callback(null, result)
        }
    });


}// end get all users in a hash

// function to set new online user.
let insertIntoHash = (hashName, key, value, callback) => {

    client.HMSET(hashName, [
        key, value
    ], (err, result) => {

        if (err) {

            logger.error("Error while inserting data into Hash : "+ hashName + "and key: " + key, value,
            "redisLib.js : insertIntoHash()", 10, err)
            callback(err, null)

        } else {
            callback(null, result)
        }
    });


}// end set a new online user in hash

let deleteFromHash = (hashName, key, callback) => {

    client.HDEL(hashName, key, (err, result) => {
        
        if (err) {
            
            logger.error("Error while deleting data from Hash : "+ hashName + "and key: " + key, value,
            "redisLib.js : deleteFromHash()", 10, err)
            callback(err, null)

        } else if(result == 0){

            logger.error("Error while deleting data from Hash : "+ hashName + "and key: " + key, value,
            "redisLib.js : deleteFromHash()", 10, err)
            callback(null, result)

        } else if(result > 0){

            logger.info("Entries deleted with keys :- " + key.toString(), "redisLib.js : deleteFromHash()", 1)
            callback(null, result)
        }
    });
    return true;

}// end delete user from hash

module.exports = {

    getDataFromHash: getDataFromHash,
    insertIntoHash: insertIntoHash,
    deleteFromHash: deleteFromHash,
    getDataFromHash: getDataFromHash,
    getAllDataFromHash: getAllDataFromHash

}

