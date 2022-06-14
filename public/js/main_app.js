const socket = io();
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer();
// var myPeer
let myVideoStream;
var newUser;
const myVideo = document.createElement('video')
myVideo.muted = true;
const myScreen = document.createElement('video');
myScreen.muted = true;
var peers = {}
// var socket_info = [];
var user_name = new Object();
myPeer.on('open', peerid => {
  // Video Sharing 
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    socket.emit('join-room-success', localStorage.getItem("code"), peerid, socket.id, (document.querySelector("#user_name").value) ? document.querySelector("#user_name").value : "Someone", false);
    socket.emit("store-user", stream.id);
    // count++;
    // user_name["names"].push(document.querySelector("#user_name").value);
    // localStorage.setItem("names" , user_name.toString());
    // localStorage.getItem("names-list" , )
    socket.on('user-connected', (peerid, socId, isScreen) => {

      console.log("isScreen", isScreen);
      console.log("join success");
      connectToNewUser(peerid, socId, stream , false);
      if (!isScreen) {
      }
    })
    myVideoStream = stream;
    myVideo.classList.add(stream.id);
    addVideoStream(myVideo, stream);
    myPeer.on('call', call => {
      const video = document.createElement('video')
      call.answer(stream);
      call.on('stream', userVideoStream => {
        video.classList.add(userVideoStream.id);
        addVideoStream(video, userVideoStream)
      })
    })
    // Sending Message
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

  // Screen Sharing
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
  // console.log(localStorage.getItem("code"));
  // socket.emit('join-request', localStorage.getItem("code"), peerid, socket.id);
  // socket.on("join-room", (peerid, socketId) => {
  //   document.querySelector(".request-freez").classList.remove("hid");
  //   console.log("hello");
  //   let btns = document.querySelectorAll(".permit button")
  //   btns.forEach(e => {
  //     e.addEventListener("click", evt => {
  //       if (evt.target.classList[0] == "allow") {
  //         console.log(evt.target.classList[0]);
  //         console.log(peerid);
  //         socket.emit("permission-allowed", peerid, socketId)
  //         socket.on("now-connect-to-room", (peerid, socketId) => {
  //           console.log("yes");
  //         })
  //         // socket.emit("status", "allow");
  //       } else {
  //         socket.emit("join-room-faliure", "deny");
  //       }
  //     })
  //   })
  // })
})

socket.on('user-disconnect', (userId, streamId) => {
  // socket.emit("disconnect-user-found", userId);
  console.log(streamId);
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
socket.on("close-screen", () => {
  console.log("closed");
})
// Connecting New User
function connectToNewUser(peerid, socId, stream, isScreen) {
  var call;
  if (isScreen) {
    call = myPeer.call(peerid, undefined);
  } else {
    call = myPeer.call(peerid, stream)
  }
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

function addVideoStream(video, stream, isScreen) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  let video_text = document.createElement("span")
  video_text.textContent = (document.querySelector("#user_name").value);
  let video_div = document.createElement("div");
  video_text.classList.add("name");
  video_div.appendChild(video_text)
  video_div.appendChild(video);
  video_div.style.position = "relative"
  video_div.classList.add("video");
  if (isScreen) {
    video_div.classList.add("screen");
  }
  video_div.classList.add(stream.id);
  if (isScreen) {
    return videoGrid.prepend(video_div);
  }
  videoGrid.append(video_div);
}


// document.querySelector(".fa-user-freinds").addEventListener 

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