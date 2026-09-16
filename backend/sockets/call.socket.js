export const registerCallHandlers = (io, socket, onlineUser) => {

  socket.on("call-user", (data) => {
    const {to , caller} = data;
    if(!caller || !to) return;
    const socketId = onlineUser[to];
    if(!socketId)return;
    if (socketId) {
      socket.to(socketId).emit("incoming-call", caller);
    }
  });


  socket.on("call-accepted", (data) => {
    const { to } = data;
    if(!to)return;
    const socketId = onlineUser[to];
    if(!socketId)return;
    if (socketId) {
      socket.to(socketId).emit("call-accepted");
    }
  });

  socket.on("call-rejected", (data) => {
    const { to } = data;
    if(!to){
      return;
    }
    const socketId = onlineUser[to];
    if(!socketId){
      return;
    }
    if (socketId) {
      socket.to(socketId).emit("call-rejected");
    }
  });



  socket.on("call-end", (data) => {
    const { to } = data;
    if(!to){
      return;
    }
    const socketId = onlineUser[to];
    if(!socketId)retur;
    if (socketId) {
      socket.to(socketId).emit("call-end");
    }
  });


  socket.on("offer", (data) => {
    const {to , from , offer} = data;
    if(!to || !from || !offer){
      return;
    }
    const socketId = onlineUser[to];
    if(!socketId){
      return;
    }
    if (socketId) {
      socket.to(socketId).emit("offer", {
        offer,
        from,
      });
    }
  });


  socket.on("answer", (data) => {
    const { to, answer } = data; 
    if(!to || !answer){
      return;
    }
    const socketId = to;
    if(!socketId){
      return;
    }
    if (socketId) {
      socket.to(socketId).emit("answer", answer);
    }
  });



  socket.on("ice-candidate", (data) => {
    const { to, candidate } = data;
    if(!to || !candidate){
      return;
    }
    const socketId = onlineUser[to];
    if(!socketId){
      return;
    }
    if (socketId) {
      socket.to(socketId).emit("ice-candidate", candidate);
    }
  });

};