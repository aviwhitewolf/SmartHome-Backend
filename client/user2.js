// connecting with sockets.
const socket = io('http://localhost:3000');

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6IkRDOTlLVElLQyIsImlhdCI6MTYwNTUwOTUxMjI3MSwiZXhwIjoxNjA1ODExOTEyLCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJ1bmNpYSIsImRhdGEiOnsidXNlcklkIjoiUUhjbmpNS3o3IiwiZmlyc3ROYW1lIjoiQXZpbmFzaCIsImxhc3ROYW1lIjoiS3VtYXIiLCJlbWFpbCI6ImF2aW5hc2guNzM1NUBnbWFpbC5jb20iLCJtb2JpbGVOdW1iZXIiOjk4NzY1NDMyMTAsImNvdW50cnkiOiJJbmRpYSJ9fQ.nYxI2DZeiGGU4Wz4taJI40uQtMqUi5S5974HfRd-bys"
const userId= "SJ-iectqM"

let chatMessage = {
  createdOn: Date.now(),
  receiverId: 'H1pOQGY9M',//putting user2's id here 
  receiverName: "Mr Xyz",
  senderId: userId,
  senderName: "Aditya Kumar"
}

let chatSocket = () => {

  socket.on('verifyUser', (data) => {

    console.log("socket trying to verify user", data);

    socket.emit("set-user", authToken);

  });

  socket.on(userId, (data) => {

    console.log("you received a message from "+data.senderName)
    console.log(data.message)

  });

  socket.on("online-user-list", (data) => {

    console.log("Online user list is updated. some user can online or went offline")
    console.log(data)

  });


  $("#send").on('click', function () {

    let messageText = $("#messageToSend").val()
    chatMessage.message = messageText;
    socket.emit("chat-msg",chatMessage)

  })

  $("#messageToSend").on('keypress', function () {

    socket.emit("typing","Aditya Kumar")

  })

  socket.on("typing", (data) => {

    console.log(data+" is typing")
    
    
  });



}// end chat socket function

chatSocket();
