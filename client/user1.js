// connecting with sockets.
const socket = io('http://localhost:3000');

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6ImxvNzJ2Y1FZNyIsImlhdCI6MTYyMTA5MDg0NjM0MCwiZXhwIjoxNjIxMzkzMjQ2LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJ1bmNpYSIsImRhdGEiOnsidXNlcklkIjoiX3NHSGczcVN4IiwiZmlyc3ROYW1lIjoiQXNoaXNoIiwibGFzdE5hbWUiOiJLdW1hciIsImVtYWlsIjoiYXNoaXNobWFyY2gxMkBnbWFpbC5jb20iLCJtb2JpbGVOdW1iZXIiOjk0MTgyOTA0MzQsImNvdW50cnkiOiJJTiJ9fQ.isl5F3oH2onZjNObdf_2aIvmxecqAmwb-mokYP3GmOU"
const homeId = 'CpxhyE5kv';
const roomId = 'oSDGDCRmz';
const devices = [
  {
    deviceName : "AC",
    deviceId: 'C0pS46DUWv',
    state: 0,
    voltage: 150
    // extra: ''
  },
  {
    deviceName : "Bulb",
    deviceId: 'He-6VL3Bd',
    state: 1,
    voltage: 255
    // extra: ''
  }
];
const updateEventName = 'update-device-state-' + homeId
const changeEventName = 'change-state-' + homeId

let deviceData = {
    authToken: authToken,
    homeId: homeId,
    roomId: roomId,
    devices: devices,
    type: 's'
  
}

let chatSocket = () => {

  socket.on('verifyUser', (data) => {

    console.log(data);

    let userData = {};
    userData.authToken = authToken;
    socket.emit("set-user", deviceData);

  });



  socket.on('incoming-device-state-change', (data) => {
    console.log("Incoming Data")
    console.log(data)
  })

  socket.on('connection-error', (data) => {

    console.log("Errror");
    console.log(data)


  });

  socket.on('set-user-success', (data) => {
    console.log("Success");
    console.log(data)
  })


  socket.on('set-user-error', (data) => {
    console.log("Errror");
    console.log(data)
  })

  $("#send").on('click', function () {

    var messageText = $("#messageToSend").val()
    let device = [  {
      deviceName : "AC",
      deviceId: 'C0pS46DUWv',
      state: parseInt(messageText),
      voltage: 150
      // extra: ''
    }]
    deviceData.devices = device 
    socket.emit('device-state-change', deviceData)

  })

}// end chat socket function

chatSocket();
