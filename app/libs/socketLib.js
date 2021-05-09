const socketio = require('socket.io');
const check = require("./checkLib.js");
const response = require('./../libs/responseLib');
const tokenLib = require("./../libs/tokenLib.js");
const logger = require('./../libs/loggerLib.js');

const setUserService = require("./../services/socketIo/setUser");
const updateDeviceAndUserRedis = require("../services/socketIo/updateDeviceAndUser");

// if 2 software are connected and one of then gets disconnected then you are updating softwareConnected as 'n'
//which is wrong


let setServer = (server) => {

    let io = socketio.listen(server);
    // this is set of all pipes means set of all sockets that are created by different users
    // let myIo = io.of('/chat') this is just routing if we want chat application to run on http://localhost:3000/chat
    let myIo = io.of('/')


    myIo.on('connection', (socket) => {

        console.log("Socket Connected ==> emitting 'verify user'");

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

                
                socket.to(data.roomId).emit('incoming-device-state-change',data);

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

    });
}


module.exports = {
    setServer: setServer
}