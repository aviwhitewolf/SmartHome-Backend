const socketio = require('socket.io');
const check = require("./checkLib.js");
const setUserService = require("./../services/socketIo/setUser");
const updateDeviceAndUserRedis = require("../services/socketIo/updateDeviceAndUser");


let setServer = (server) => {

    let io = socketio.listen(server);
    // this is set of all pipes means set of all sockets that are created by different users
    // let myIo = io.of('/chat') this is just routing if we want chat application to run on http://localhost:3000/chat
    let myIo = io.of('/')


    myIo.on('connection', (socket) => {

        console.log("Socket Connected ==> emitting 'verify user'");

        socket.emit("verifyUser", 'Test');

        socket.on('set-user', (data) => {

            data.socketId = socket.id
            setUserService.setUser(data)
            .then((result) => {

                socket.join(result.data.room)
                socket.emit('set-user-success', result)

            })
            .catch((err) => {

                socket.emit('set-user-error', err)
                socket.disconnect(0)

            })

        })


        socket.on('disconnect', () => {
            let data = {}
            data.socketId = socket.id
            updateDeviceAndUserRedis.updateDeviceAndUserRedis(data)
            .then((result) => {

                socket.leave(result.data.room)
                delete result.data.room
                socket.emit('disconnect-device-success', result)

            })
            .catch((err) => {

                socket.emit('set-user-error', err)
                socket.disconnect(0)

            })

        })


        socket.on('device-state-change', (data) => {

            if (socket.hasOwnProperty("userId") && !check.isEmpty(socket.userId)) {

                if (check.isEmpty(data.deviceId)) {
                    // socket.emit('error', { status: 500, error: 'Please provide correct deviceId'})  

                } else if (check.isEmpty(data.homeId)) {
                    // socket.emit('error', { status: 500, error: 'Please provide correct state of a device'})  

                } else if (check.isEmpty(data.state)) {
                    // socket.emit('error', { status: 500, error: 'Please provide correct state of a device'})  

                } else {

                    let _data = {};
                    _data['homeId'] = data.homeId;
                    _data['userId'] = socket.userId;
                    _data.state = data.state
                    _data.deviceId = data.deviceId
                    console.log(_data)
                    //emiting device state
                    // socket.emit('update-device-state-'+data.homeId, _data)

                    let _eventName = 'update-device-state-' + data.homeId
                    console.log(_eventName);
                    myIo.emit(_eventName, _data)

                    // event to save chat.
                    setTimeout(function () {
                        eventEmitter.emit('save-device-state', _data);

                    }, 1000)

                }

            } else {
                console.log('Token not set')
            }

        }) // end of listening set-user event


    });
}


module.exports = {
    setServer: setServer
}