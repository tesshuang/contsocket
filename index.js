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
                    console.log("body"+socket.myRoom);
                }else{
                    console.log("error");
                }
            }
        )
        .on('data', function(data) {
            // decompressed data as it is received
            console.log('decoded chunk: '+data);
            if(data.length !== 0){
                var ndata = JSON.parse(data)
                allusers[socket.myRoom].qobj = ndata;
                socket.emit("sendquiz", ndata);
                /*console.log("sendobj"+allusers[socket.myRoom].qobj);*/
            }
            
            
          })
          .on('response', function(response) {
            // unmodified http.IncomingMessage object
            response.on('data', function(data) {
              // compressed data as it is received
              console.log('received ' + data.length);
                console.log("what is room"+socket.myRoom);
            })
          })
    });
    
    socket.on("answer", function(data){
        console.log(data, allusers[socket.myRoom].qobj[data.index].keyans);
        var point = 0;
        if(data.key === allusers[socket.myRoom].qobj[data.index].keyans){
            point = 1
        }else{
            point = -1
        }
        var pointobj = {
            usrpoint:point,
            id:socket.id
        }
        console.log(socket.id);
        socket.emit("points", pointobj);
    })
    
    
    socket.on("disconnect", function(data){
       
       if(socket.myRoom){
            var index = allusers[socket.myRoom].usrinfo.indexOf(socket.id);
            allusers[socket.myRoom].usrinfo.splice(index,1);
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