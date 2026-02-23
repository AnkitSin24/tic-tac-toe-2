const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static("public"))

let rooms = {}

io.on("connection", (socket)=>{

socket.on("createRoom",(name)=>{

const roomCode = Math.floor(1000 + Math.random()*9000).toString()

rooms[roomCode] = {
players:[{id:socket.id,name:name,symbol:"X"}],
board:["","","","","","","","",""]
}

socket.join(roomCode)

socket.emit("roomCreated",roomCode)

})

socket.on("joinRoom",(data)=>{

const room = rooms[data.code]

if(room && room.players.length<2){

room.players.push({
id:socket.id,
name:data.name,
symbol:"O"
})

socket.join(data.code)

io.to(data.code).emit("startGame",room.players)

}else{

socket.emit("roomError")

}

})

socket.on("move",(data)=>{

const room = rooms[data.room]

if(!room) return

room.board[data.index] = data.symbol

socket.to(data.room).emit("move",data)

})

socket.on("chat",(data)=>{

io.to(data.room).emit("chat",data)

})

})

http.listen(3000,()=>{
console.log("Server running http://localhost:3000")
})