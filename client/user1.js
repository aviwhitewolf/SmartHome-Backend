// connecting with sockets.
const socket = io('http://localhost:3000');

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6Il9iN2xidTVhbyIsImlhdCI6MTYxMDAzNTY4ODA5NiwiZXhwIjoxNjEwMzM4MDg4LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJ1bmNpYSIsImRhdGEiOnsidXNlcklkIjoiUWx1NU5IOWQyIiwiZmlyc3ROYW1lIjoiQXZpbmFzaCIsImxhc3ROYW1lIjoiS3VtYXIiLCJlbWFpbCI6ImF2aW5hc2guNzM1NUBnbWFpbC5jb20iLCJtb2JpbGVOdW1iZXIiOjk0MTgyOTA0MzQsImNvdW50cnkiOiJJbmRpYSJ9fQ.mk1ZivfluIKSDCpVs9Gz4WOOTP76ygThkebMTAsgYzU"
const homeId = 'S--W6DbxU';
const roomId = '6QpZ_vI7Y';
const devices = [
  {
    deviceId: 'l4LJ06xN-',
    state: 0,
    voltage: 150,
    extra: ''
  },
  {
    deviceId: 'xA5OqZ6fy2',
    state: 1,
    voltage: 255,
    extra: ''
  }
];
const updateEventName = 'update-device-state-' + homeId
const changeEventName = 'change-state-' + homeId

let deviceData = {
  authToken: authToken,
  data: {
    homeId: homeId,
    roomId: roomId,
    devices: devices,
    type: 's'
  }
}

let chatSocket = () => {

  socket.on('verifyUser', (data) => {

    console.log("socket trying to verify user", data);

    let userData = {};
    userData.authToken = authToken;
    socket.emit("set-user", deviceData);

  });


  socket.on(updateEventName, (data) => {
    console.log("Updating device state");
    console.log(data)
  });


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


  // socket.on(userId, (data) => {

  //   console.log("you received a message from "+data.senderName)
  //   console.log(data.message)

  // });

  // //to join room, we are subcribed to oline-user-list
  // socket.on("online-user-list", (data) => {

  //   console.log("Online user list is updated. some user can online or went offline")
  //   console.log(data)

  // });

  // socket.on("typing", (data) => {

  //   console.log(data+" is typing")


  // });

  $("#send").on('click', function () {

    var messageText = $("#messageToSend").val()
    console.log(messageText);
    deviceData.state = parseInt(messageText);
    socket.emit('change-state', deviceData)

  })

  // $("#messageToSend").on('keypress', function () {

  //   socket.emit("typing","Mr Xyz")

  // })




}// end chat socket function

chatSocket();
