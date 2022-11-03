const socket = io();

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.getElementById("room");
const msgForm = room.querySelector('form');


room.hidden = true;

let roomName;
let nickname;

function addMessage(message) {
  console.log('addMsg');
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const msgInput = room.querySelector("input");
  const value = msgInput.value;
  socket.emit("new_message", value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  msgInput.value = "";
}


function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  const h4 = room.querySelector("h4");
  h3.innerText = `Room ${roomName}`;
  h4.innerText = `${nickname}`;
  const msgForm = room.querySelector("form");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleWelcomeSubmit(event) {
  event.preventDefault();
  roomName = welcomeForm.querySelector("#room-name").value;
  nickname = welcomeForm.querySelector("#nickname").value;
  socket.emit("nickname", nickname);
  socket.emit("enter_room", roomName, showRoom);
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// nicknameFrom.addEventListener('submit',handleNicknameSubmit);

socket.on("welcome", (user) => {
  addMessage(`${user} joined`);
});

socket.on("bye", (user) => {
  addMessage(`${user} left`);
});

socket.on('room_change',(list)=>{
  const ul = welcome.querySelector("ul");
  ul.innerHTML = '';
  list.forEach((i)=>{
    const li = document.createElement("li");
    console.log(li);
    li.innerHTML = i;
    ul.append(li);
  });
})


socket.on("new_message",(addMessage)); //addMessage
socket.on("new_message",()=>{console.log('new msg receive')}); //addMessage