const socket = io();
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer();
let myVideoStream;

console.log(socket);

const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  console.log(socket.id);
  myVideoStream = stream;
  addVideoStream(myVideo,stream)
  myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video')
    // video.className = socket.id
    call.on('stream', userVideoStream => {
      addVideoStream(video ,userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
  document.addEventListener("keypress", (evt) => {
    if (evt.keyCode == 13) {
      let text = document.querySelector("#chat_message").value;
      if (text != "" || null || undefined) {
        socket.emit("message", text, document.querySelector("#user_name").value);
        document.querySelector("#chat_message").value = "";
      }
    };
  })
  socket.on("createMessage", (message, user) => {
    let child = document.createElement("li");
    child.innerHTML = `<b>${user}</b><br/>${message}`
    document.querySelector("ul").appendChild(child);
  })
})

document.querySelector(".leave_meeting").addEventListener("click", e => {
  // console.log("hello");
  socket.emit("disconnect", socket.id)
})
socket.on('disconnect', userId => {
  console.log("hello");
  if (peers[userId]) {
    document.querySelector(".video-grid").childNodes.forEach( e =>{
      if(userId == e.classList[0]){

        videoGrid.removeChild(e);
      }
    })
    peers[userId].close()
  }
})


myPeer.on('open', id => {
  socket.emit('join-room', localStorage.getItem("code"), id)
})


function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video ,stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



const scrollToBottom = () => {
  var d = document.querySelector('.main__chat_window');
  d.scrollTop = d.scrollHeight;
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}