const socket = io();
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer();
let myVideoStream;

// console.log(socket);

const myVideo = document.createElement('video')
myVideo.muted = true;
const myScreen = document.createElement('video');
myScreen.muted = true;
const peers = {}
var peers_id = [];
myPeer.on('open', peerid => {
  socket.emit('join-room', localStorage.getItem("code"), peerid, socket.id, (document.querySelector("#user_name").value) ? document.querySelector("#user_name").value : "Someone");
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    socket.emit("store-user", stream.id);
    myVideoStream = stream;
    myVideo.classList.add(stream.id);
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
      call.answer(stream);
      const video = document.createElement('video')
      // video.className = socket.id
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    })
    socket.on('user-connected', (peerid, sockectId) => {
      connectToNewUser(peerid, sockectId, stream)
    })


    document.querySelector("#screen-share").addEventListener("click", evt => {
      navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: true
      }).then(
        stream => {
          addVideoStream(myScreen, stream);
          stream.getVideoTracks()[0].onended = () => {
            console.log("screen stopped");
            console.log(socket.id);
            socket.emit("screen-disconnect", socket.id, stream.id, localStorage.getItem("code"));
          }
          socket.emit('join-room', localStorage.getItem("code"), socket.id, (document.querySelector("#user_name").value) ? document.querySelector("#user_name").value : "Someone");
          socket.emit("store-user", stream.id);
          socket.on('user-connected', (peerid, sockectId, username) => {
            connectToNewUser(peerid, sockectId, stream)
          })
          // connectToNewUser(myScreen);
          // socket.emit("screen" , socket.id =>{
          // } )
        }
      )
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
      document.querySelector("ul").scrollIntoView(false);
    })
  })
})

socket.on("remove-screen", stream => {
  document.querySelectorAll(".video").forEach(e => {
    console.log(e);
    // var userStreamId = socket_info.get(userId);
    if (e.classList.contains(stream)) {
      videoGrid.removeChild(e);
    }
  })
})



// document.querySelector(".leave_meeting").addEventListener("click", e => {
//   // console.log("hello");
//   socket.emit("disconnect", socket.id)
// })
socket.on('disconnect', userId => {
  console.log("hello");
  document.querySelectorAll(".video").forEach(e => {
    console.log(e);
    // var userStreamId = socket_info.get(userId);
    if (e.classList.contains(streamId)) {
      videoGrid.removeChild(e);
    }
  })
  if (peers[userId]) {
    peers[userId].close()
  }
})

// requesting to join room



// socket.on('join-request', async (username , userId) => {
//   console.log("hello");
//   document.querySelector(".request-freez").classList.remove("hid");
//   let btns = document.querySelectorAll(".permit button")
//   btns.forEach(e => {
//     e.addEventListener("click", evt => {
//       if (evt.target.classList[0] == "allow") {
//         console.log(evt.target.classList[0]);
//         socket.to(userId).emit("status", "allow");
//       } else {
//         socket.emit("status", "deny");
//       }
//     })
//   })
// })






function connectToNewUser(peerid, sockectId, stream) {
  const call = myPeer.call(peerid, stream)
  const video = document.createElement('video')
  video.classList.add(stream.id);
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[peerid] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  let video_text = document.createElement("span")
  video_text.textContent = document.querySelector("#user_name").value;
  let video_div = document.createElement("div");
  video_text.classList.add("name");
  video_div.appendChild(video_text)
  video_div.appendChild(video);
  video_div.style.position = "relative"
  video_div.classList.add(stream.id);
  videoGrid.append(video_div);
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