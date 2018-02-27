const server = require("http").Server();
const port = process.env.PORT || 4007;
var io = require("socket.io")(server);

var allusers ={};

io.on("connection", function(socket){
    console.log("connected");
    
    socket.on("joinroom", function(data){
        console.log(data);
        socket.join(data);
        
        socket.myRoom = data;
        /*socket.emit("yourid", socket.id);*/
        
        if(!allusers[data]){
            allusers[data] = [];
            
        }
        
        allusers[data].push(socket.id);
        console.log(allusers);
        
        if(allusers[data].length === 1){
            io.to(data).emit("waiting");
        }else if(allusers[data].length === 2){
             io.to(data).emit("startgame");
        }else if(allusers[data].length > 2){
          socket.to(socket.id).emit("toomany");
        }
        
        io.to(data).emit("userjoined", allusers[data]);
    })
});

server.listen(port, (err)=>{
    if(err){
        console.log("Err is "+err);
        return false
    }
    console.log("Contest Socket is running.");
})