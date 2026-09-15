export const registerCallHandlers = (io, socket, onlineUser) => {

  socket.on("call-user", (data) => {
    const socketId = onlineUser[data.to];

    if (socketId) {
      socket.to(socketId).emit("incoming-call", data.caller);
    }
  });


  socket.on("call-accepted", (data) => {
    const { to } = data;
    const socketId = onlineUser[to];

    if (socketId) {
      socket.to(socketId).emit("call-accepted");
    }
  });



  socket.on("call-rejected", (data) => {
    const { to } = data;
    const socketId = onlineUser[to];

    if (socketId) {
      socket.to(socketId).emit("call-rejected");
    }
  });



  socket.on("call-end", (data) => {
    const { to } = data;
    const socketId = onlineUser[to];

    if (socketId) {
      socket.to(socketId).emit("call-end");
    }
  });


  socket.on("offer", ({ to, from, offer }) => {

    const socketId = onlineUser[to];

    if (socketId) {
      socket.to(socketId).emit("offer", {
        offer,
        from,
      });
    }
  });


  socket.on("answer", ({ to, answer }) => {
    

    const socketId = to;

    if (socketId) {
      socket.to(socketId).emit("answer", answer);
    }
  });



  socket.on("ice-candidate", ({ to, from, candidate }) => {


    const socketId = onlineUser[to];

    if (socketId) {
      socket.to(socketId).emit("ice-candidate", candidate);
    }
  });

};