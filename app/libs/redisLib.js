//redis lib
const check = require("./checkLib.js");
const redis = require('redis');
let client = redis.createClient();

client.on('connect', () => {

    console.log("Redis connection successfully opened");

});

let getAllDataFromHash = (hashName, callback) => {

    client.HGETALL(hashName, (err, result) => {

        if (err) {

            console.log(err);
            callback(err, null)

        } else if (check.isEmpty(result)) {

            console.log("list is empty");
            console.log(result)

            callback(null, {})

        } else {

            console.log(result);
            callback(null, result)

        }
    });


}// end get all users in a hash

let getDataFromHash = (hashName, key, callback) => {

    client.HGET(hashName, key, (err, result) => {

        if (err) {

            console.log(err);
            callback(err, null)

        } else if (check.isEmpty(result)) {

            console.log("list is empty");
            console.log(result)

            callback(null, {})

        } else {

            console.log(result);
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

            console.log(err);
            callback(err, null)

        } else {

            console.log("entery has been set in the hash map");
            console.log(result)
            callback(null, result)

        }
    });


}// end set a new online user in hash

let deleteFromHash = (hashName, key, callback) => {

    client.HDEL(hashName, key, (err, result) => {
        
        if (err) {
            
            console.log(err);
            callback(err, null)

        } else if(result == 0){

            console.log("No entry found in hashmap");
            console.log(result)
            callback(null, result)

        } else if(result > 0){

            console.log(result + " Entries deleted with keys :- " + key.toString())
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

