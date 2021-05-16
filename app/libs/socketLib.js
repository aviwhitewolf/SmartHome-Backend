const socketio = require('socket.io');
const check = require("./checkLib.js");
const response = require('./responseLib');
const tokenLib = require("./tokenLib.js");
const logger = require('./loggerLib.js');

const setUserService = require("../controllers/socketIo/setUser").setUser
const updateDeviceAndUserRedis = require("../controllers/socketIo/updateDeviceAndUser").updateDeviceAndUserRedis
const deviceStateChangeController = require('../controllers/socketIo/deviceStateChange').deviceStateChange
const {connectDeviceSchema} = require('./../services/Validation/connectDevice');

let setServer = (server) => {

    let io = socketio.listen(server);
    let myIo = io.of('/')

    myIo.on('connection', (socket) => {

        socket.emit("verifyUser", 'Requesting to Verify user...');

        //set-user
        socket.on('set-user', (data) => {

            try {

                data.socketId = socket.id
                isUserAuthorised(data)
                    .then(isValidData)
                    .then(setUserService)
                    .then((result) => {
                        console.log("join room :" + result.roomId)
                        socket.join(result.roomId)
                        socket.emit('set-user-success', response.generate(false, 'Device and user added to realtime database', 200, null))

                    }).catch((err) => {

                        socket.emit('set-user-error', err)
                        if (socket.connected) socket.disconnect()
                    })

            } catch (err) {
                console.log("Error", err)
                if (socket.connected) {
                    socket.emit('set-user-error', response.generate(true, 'Internal server error', 500, null))
                }
            }

        })////set-user end


        //Disconnect
        socket.on('disconnect', () => {
            try {
                let data = {}

                data.socketId = socket.id
                updateDeviceAndUserRedis(data)
                    .then((result) => {
                        console.log("leave room : " + result.roomId)
                        socket.leave(result.roomId)
                        socket.emit('disconnect-device-success', response.generate(true, 'Device disconnected from realtime database', 200, null))

                    })
                    .catch((err) => {

                        socket.emit('set-user-error', err)
                        if (socket.connected) socket.disconnect()

                    })


            } catch (err) {
                console.log("Error", err)
                if (socket.connected) {
                    socket.emit('set-user-error', response.generate(true, 'Internal server error', 500, null))
                }
            }

        })//Disconnect end

        
        //device-state-change
        socket.on('device-state-change', (data) => {

            try {

                isUserAuthorised(data)
                .then(isValidData)
                .then((data) => {

                    delete data.authToken
                    socket.to(data.roomId).emit('incoming-device-state-change',response.generate(false, 'Changed Data', 200, data));
                    deviceStateChangeController(data)

                }).catch((err) => {
                    socket.emit('set-user-error', err)
                    if (socket.connected) socket.disconnect()
                })
                
            } catch (err) {
                console.log("Error", err)
                if (socket.connected) {
                    socket.emit('set-user-error', response.generate(true, 'Internal server error', 500, null))
                }
            }

        })//device-state-change end


        // socket.on('incoming-device-state-change', (data) => {
        //   console.log(data)
        // })


        // Check user is authorised
        let isUserAuthorised = (data) => {
            return new Promise((resolve, reject) => {

                try {

                    tokenLib.verifyClaimWithoutSecret(data.authToken, (err, user) => {

                        if (err) {

                            logger.error('Internal server Error - while verifying token or token expired', 'SocketLib : isUserAuthorised()', 7, err)
                            let apiResponse = response.generate(true, 'Token expired', 400, null)
                            reject(apiResponse)

                        } else {
                            data.userId = user.data.userId
                            resolve(data)

                        }
                    })

                } catch (err) {

                    logger.error('Internal server Error', 'SocketLib : isUserAuthorised', 10, err)
                    let apiResponse = response.generate(true, 'Internal server error', 500, null)
                    reject(apiResponse)

                }

            })

        }

        let isValidData = (data) => {
            return new Promise((resolve, reject) => {
                connectDeviceSchema.validateAsync(data).then((result) => {
                    resolve(result)
                }).catch((err) => {
                    return reject(response.generate(true, 'Invalid Data', 422, err.message))
                })
            })

        }

    });
}


module.exports = {
    setServer: setServer
}