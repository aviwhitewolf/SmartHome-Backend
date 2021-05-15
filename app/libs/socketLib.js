const socketio = require('socket.io');
const check = require("./checkLib.js");
const response = require('./responseLib');
const tokenLib = require("./tokenLib.js");
const logger = require('./loggerLib.js');

const setUserService = require("../controllers/socketIo/setUser");
const updateDeviceAndUserRedis = require("../controllers/socketIo/updateDeviceAndUser");
const deviceStateChangeController = require('../controllers/socketIo/deviceStateChange')
const { data, validationResult } = require('express-validator');




let setServer = (server) => {

    let io = socketio.listen(server);
    let myIo = io.of('/')


    myIo.on('connection', (socket) => {

        socket.emit("verifyUser", 'Requesting to Verify user...');


        socket.on('set-user', (data) => {

            try {

                data.socketId = socket.id
                isUserAuthorised(data)
                    .then(setUserService.setUser)
                    .then((result) => {
                        console.log("join room :" + result.roomId)
                        socket.join(result.roomId)
                        socket.emit('set-user-success', response.generate(false, 'Device and user added to realtime database', 200, null))

                    }).catch((err) => {

                        socket.emit('set-user-error', err)
                        if (socket.connected) {
                            socket.disconnect();
                        }


                    })

            } catch (err) {
                console.log("Error", err)
                if (socket.connected) {
                    socket.emit('set-user-error', response.generate(true, 'Internal server error', 500, null))
                }
            }

        })

        socket.on('disconnect', () => {
            try {

                let data = {}

                data.socketId = socket.id
                updateDeviceAndUserRedis.updateDeviceAndUserRedis(data)
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

        })

        socket.on('device-state-change', (data) => {

            try {

                isValidData(data)
                then(isUserAuthorised)
                .then((data) => {
                    
                    socket.to(data.roomId).emit('incoming-device-state-change',data);
                    deviceStateChangeController.deviceStateChange(data)

                }).catch((err) => {
                    
                    socket.emit('set-user-error', err)
                    if (socket.connected) {
                        socket.disconnect();
                    }

                })
                
                

            } catch (err) {
                console.log("Error", err)
                if (socket.connected) {
                    socket.emit('set-user-error', response.generate(true, 'Internal server error', 500, null))
                }
            }

        })

        socket.on('incoming-device-state-change', (data) => {
          console.log(data)
        })


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

                [
                    data('authToken').isString().withMessage('Home id should be string'),
                    data('homeId').isString().withMessage('Home id should be string'),
                    data('homeId').isLength({min : 5, max : 15}).withMessage('Home id length should be greater than 5 and less than 15 '),
                    data('roomId').isString().withMessage('Room id should be string'),
                    data('roomId').isLength({min : 5, max : 15}).withMessage('Room id length should be greater than 5 and less than 15 '),
                    data('devices').isArray().withMessage('Device data missing'),
                    data('devices.*.deviceName').isString().withMessage('Device name should be string'),
                    data('devices.*.deviceName').isLength({min : 2, max : 25}).withMessage('Device name length should be greater than 3 and less than 25'),
                    data('devices.*.state').isInt({ge : 0, le : 1}).withMessage('State should be whole number 0 or 1'),
                    data('devices.*.voltage').isInt({ge : 0, le : 255}).withMessage('Voltage should be whole number between 0 to 255'),
                    data('type').isString().withMessage('Home id should be string'),
                    data('type').isLength({min : 1, max : 1}).withMessage('Home id should be string')
                ]

                const errors = validationResult(data);
                if (!errors.isEmpty()) {
                    return reject(response.generate(true, 'Validation Error', 422, { errors: errors.array() }))
                }

                resolve(data)


            })

        }

    });
}


module.exports = {
    setServer: setServer
}