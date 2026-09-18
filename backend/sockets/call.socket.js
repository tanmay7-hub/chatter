export const registerCallHandlers = (io, socket , redis_client) => {

  socket.on("call-user",async(data) => {
    const {to , caller} = data;
    if(!caller || !to) return;
    // const socketId = onlineUser[to];
    // console.log("redis:" , redis_client);
    const socketId  = await redis_client.get(`online:${to}`);
    if(!socketId)return;
    if (socketId) {
      socket.to(socketId).emit("incoming-call", caller);
    }
  });


  socket.on("call-accepted", async(data) => {
    const { to } = data;
    if(!to)return;
    // const socketId = onlineUser[to];
     const socketId  = await redis_client.get(`online:${to}`);
    if(!socketId)return;
    if (socketId) {
      socket.to(socketId).emit("call-accepted");
    }
  });

  socket.on("call-rejected", async(data) => {
    const { to } = data;
    if(!to){
      return;
    }
    // const socketId = onlineUser[to];
     const socketId  = await redis_client.get(`online:${to}`);
    if(!socketId){
      return;
    }
    if (socketId) {
      socket.to(socketId).emit("call-rejected");
    }
  });



  socket.on("call-end", async(data) => {
    const { to } = data;
    if(!to){
      return;
    }
    // const socketId = onlineUser[to];
     const socketId  = await redis_client.get(`online:${to}`);
    if(!socketId)return;
    if (socketId) {
      socket.to(socketId).emit("call-end");
    }
  });


  socket.on("offer", async(data) => {
    const {to , from , offer} = data;
    if(!to || !from || !offer){
      return;
    }
    // const socketId = onlineUser[to];
     const socketId  = await redis_client.get(`online:${to}`);
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


  socket.on("answer", async(data) => {
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



  socket.on("ice-candidate", async(data) => {
    const { to, candidate } = data;
    if(!to || !candidate){
      return;
    }
    // const socketId = onlineUser[to];
    const socketId  = await redis_client.get(`online:${to}`);
    if(!socketId){
      return;
    }
    if (socketId) {
      socket.to(socketId).emit("ice-candidate", candidate);
    }
  });

};