const socket = io()

let room=""
let playerSymbol=""
let turn=false

let scoreX=0
let scoreO=0

const cells=document.querySelectorAll(".cell")

let moveSound=new Audio("sounds/move.mp3")
let winSound=new Audio("sounds/win.mp3")

const winPatterns=[

[0,1,2],
[3,4,5],
[6,7,8],
[0,3,6],
[1,4,7],
[2,5,8],
[0,4,8],
[2,4,6]

]

document.getElementById("createBtn").onclick=()=>{

const name=document.getElementById("playerName").value

socket.emit("createRoom",name)

}

document.getElementById("joinBtn").onclick=()=>{

const name=document.getElementById("playerName").value
const code=document.getElementById("roomInput").value

room=code

socket.emit("joinRoom",{name:name,code:code})

}

socket.on("roomCreated",(code)=>{

room=code

document.getElementById("roomCode").innerText="Room Code: "+code

playerSymbol="X"

})

socket.on("startGame",(players)=>{

document.getElementById("menu").style.display="none"

document.getElementById("board").classList.remove("hidden")

playerSymbol=players.find(p=>p.id===socket.id)?.symbol || "O"

turn=(playerSymbol==="X")

})

cells.forEach(cell=>{

cell.onclick=()=>{

if(cell.innerText!=="" || !turn) return

cell.innerText=playerSymbol

moveSound.play()

socket.emit("move",{

room:room,
index:cell.dataset.i,
symbol:playerSymbol

})

checkWinner()

turn=false

}

})

socket.on("move",(data)=>{

cells[data.index].innerText=data.symbol

moveSound.play()

checkWinner()

turn=true

})

function checkWinner(){

for(let p of winPatterns){

let a=cells[p[0]].innerText
let b=cells[p[1]].innerText
let c=cells[p[2]].innerText

if(a && a===b && b===c){

cells[p[0]].classList.add("win")
cells[p[1]].classList.add("win")
cells[p[2]].classList.add("win")

winSound.play()

if(a==="X"){

scoreX++

document.getElementById("scoreX").innerText=scoreX

}else{

scoreO++

document.getElementById("scoreO").innerText=scoreO

}

}

}

}

document.getElementById("restart").onclick=()=>{

cells.forEach(c=>{

c.innerText=""
c.classList.remove("win")

})

}

document.getElementById("sendBtn").onclick=()=>{

const msg=document.getElementById("chatInput").value

socket.emit("chat",{room:room,msg:msg})

}

socket.on("chat",(data)=>{

const box=document.getElementById("chatBox")

box.innerHTML+="<p>"+data.msg+"</p>"

})