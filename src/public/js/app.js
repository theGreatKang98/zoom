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
let myPeerConnection;


function addMessage(message) {
  console.log('addMsg');
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}


async function showRoom(count) {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  const h4 = room.querySelector("h4");
  h3.innerText = `Room ${roomName} (${count})`;
  h4.innerText = `${nickname}`;
  const msgForm = room.querySelector("form");
  msgForm.addEventListener("submit", handleMessageSubmit); 
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  await getMedia();
  await makeConnection();
  roomName = welcomeForm.querySelector("#room-name").value;
  nickname = welcomeForm.querySelector("#nickname").value;
  socket.emit("nickname", nickname);
  socket.emit("enter_room", roomName, showRoom);
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// nicknameFrom.addEventListener('submit',handleNicknameSubmit);

socket.on("welcome", async (user) => {
  addMessage(`${user} joined`);
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  socket.emit('offer', offer, roomName);
});
socket.on('offer',async (offer) =>{
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit('answer', answer, roomName);
  console.log(answer);
})
socket.on('answer', answer => {
  myPeerConnection.setRemoteDescription(answer);
})

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

socket.on("new_message", (addMessage));

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
async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    myFace.srcObject = myStream;
  } catch (e) {
    console.log(e);
  }
};

async function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myStream
    .getTracks()
    .forEach(i => myPeerConnection.addTrack(i, myStream));
}

muteBtn.addEventListener('click', () => {
  myStream
    .getAudioTracks()
    .forEach(track => track.enabled = !track.enabled);
})
cameraOnOffBtn.addEventListener('click', () => {
  myStream
    .getVideoTracks()
    .forEach(track => track.enabled = !track.enabled);
})




