const server = require("http").Server();
const port = process.env.PORT || 4007;
var io = require("socket.io")(server);

var allusers ={};

io.on("connection", function(socket){
        console.log("connected");
    
    socket.on("joinroom", function(data){
        console.log(data);
        socket.join(data.roomstr);
        
        socket.myRoom = data.roomstr;
        /*socket.emit("yourid", socket.id);*/
        
        if(!allusers[data.roomstr]){
            allusers[data.roomstr] = [];
            
        }
        
        var conusrinfo ={
            id: socket.id,
            conname:data.usrinfo.conname,
            conava:data.usrinfo.conava
        }
        
        allusers[data.roomstr].push(conusrinfo);
        console.log(allusers);
        
        if(allusers[data.roomstr].length === 1){
            io.to(data.roomstr).emit("waiting");
        }else if(allusers[data.roomstr].length === 2){
             io.to(data.roomstr).emit("startgame");
        }else if(allusers[data.roomstr].length > 2){
             socket.emit("toomany");
        }
        
        io.to(data.roomstr).emit("userjoined", allusers[data.roomstr]);
    });
    
    socket.on("disconnect", function(data){
       if(this.myRoom){
            var index = allusers[this.myRoom].indexOf(socket.id);
            allusers[this.myRoom].splice(index,1);
            io.to(this.myRoom).emit("userjoined", allusers[this.myRoom]);
        }
    });
});

server.listen(port, (err)=>{
    if(err){
        console.log("Err is "+err);
        return false
    }
    console.log("Contest Socket is running.");
})