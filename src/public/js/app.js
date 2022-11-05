const socket = io();

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.getElementById("room");
const msgForm = room.querySelector('form');
const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraOnOffBtn = document.getElementById('cameraOnOff');
const cameraSelector = document.getElementById('cameraSelector');

room.hidden = true;

let roomName;
let nickname;
let myStream;


function addMessage(message) {
  console.log('addMsg');
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}


function showRoom(count) {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  const h4 = room.querySelector("h4");
  h3.innerText = `Room ${roomName} (${count})`;
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

socket.on('room_change', (list, count) => {
  const ul = welcome.querySelector("ul");
  ul.innerHTML = '';
  list.forEach((i) => {
    const li = document.createElement("li");
    li.innerHTML = `${i}: ${count}`;
    ul.append(li);
  });
})

function handleMessageSubmit(event) {
  event.preventDefault();
  const msgInput = room.querySelector("input");
  const value = msgInput.value;
  socket.emit("new_message", value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  msgInput.value = "";
}

//////////////////////////////////////////////// video part
(async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myFace.srcObject = myStream;
  } catch (e) {
    console.log(e);
  }
}());

(async function getMedioList() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(i => i.kind === 'videoinput');
    cameras.forEach(i => {
      const option = document.createElement('option');
      option.value = i.deviceId;
      option.innerText = i.label;
      cameraSelector.append(option);
    })
  } catch (e) {

  }
}())

muteBtn.addEventListener('click', () => {
  myStream
    .getAudioTracks()
    .forEach(track => track.enabled = !track.enabled);
  console.log(myStream.getAudioTracks());
})
cameraOnOffBtn.addEventListener('click', () => {
  myStream
    .getVideoTracks()
    .forEach(track => track.enabled = !track.enabled);
  console.log(myStream.getVideoTracks());
})

socket.on("new_message", (addMessage)); //addMessage
