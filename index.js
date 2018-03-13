const server = require("http").Server();
const port = process.env.PORT || 4007;
var io = require("socket.io")(server);
var request = require("request");

var allusers ={};


io.on("connection", function(socket){
        console.log("connected");
    
    socket.on("joinroom", function(data){
        console.log(data);
        socket.join(data.roomstr);
        
        socket.myRoom = data.roomstr;
        /*socket.emit("yourid", socket.id);*/
        
        if(!allusers[data.roomstr]){
            allusers[data.roomstr] = {
                usrinfo:[],
                qobj:[]
            };
            
        }
        
        var conusrinfo ={
            id: socket.id,
            conname:data.usrinfo.conname,
            conava:data.usrinfo.conava
        }
        
        allusers[data.roomstr].usrinfo.push(conusrinfo);
        console.log(allusers);
        
        if(allusers[data.roomstr].usrinfo.length === 1){
            io.to(data.roomstr).emit("waiting", allusers[data.roomstr].usrinfo);
        }else if(allusers[data.roomstr].usrinfo.length === 2){
             io.to(data.roomstr).emit("startgame", allusers[data.roomstr].usrinfo);
        }else if(allusers[data.roomstr].usrinfo.length > 2){
             socket.emit("toomany");
        }
        
        /*io.to(data.roomstr).emit("userjoined", allusers[data.roomstr]);*/
    });
   
    socket.on("getquiz", function(data){
        request(
        {
            method:"GET",
            uri:"https://contestdata.herokuapp.com/getquiz/"+data
        },
            function(err, resp, body){
                if(resp.statusCode === 200){
                    console.log("body" );
                }else{
                    console.log("error");
                }
            }
        )
        .on('data', function(data) {
            // decompressed data as it is received
            console.log('decoded chunk: ' + data);
            if(data.length !== 0){
                console.log("hihi"+ socket.myRoom);
                /*
                allusers[socket.myRoom].qobj.push(data);
                socket.to(socket.myRoom).emit("sendquiz", data);*/
            }
            
            
          })
          .on('response', function(response) {
            // unmodified http.IncomingMessage object
            response.on('data', function(data) {
              // compressed data as it is received
              console.log('received ' + data.length + ' bytes of compressed data')
            })
          })
    });
    
    socket.on("disconnect", function(data){
        console.log(socket.myRoom);
       if(this.myRoom){
            var index = allusers[this.myRoom].indexOf(socket.id);
            allusers[this.myRoom].splice(index,1);
            /*io.to(this.myRoom).emit("userjoined", allusers[this.myRoom]);*/
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