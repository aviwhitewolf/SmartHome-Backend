//redis lib
const Redis = require("ioredis");
const redis = new Redis();

const logger = require('../libs/loggerLib');


redis.connect(function() {

    logger.info("Redis connection successfully opened", "redisLib.js : client.on()", 1)
    redis.flushall()

})

