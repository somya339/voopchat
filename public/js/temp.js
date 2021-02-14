const socket = io();
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer();
let myVideoStream;

// console.log(socket);

const myVideo = document.createElement('video')
myVideo.muted = true;
const myScreen = document.createElement('video');
myScreen.className = "screen"
myScreen.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {

  // leave function
  addVideoStream(myVideo, stream, socket.id);
  console.log(socket.id);
  myVideoStream = stream;
  myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video')
    // video.classList.add(socket.id);
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })
  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream, "", userId)
  })

  document.querySelector("#screen-share").addEventListener("click", evt => {
    navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: true
    }).then(
      stream => {
        myScreen.classList.add("screen");
        myScreen.classList.add(socket.id + "1324@@");
        addVideoStream(myScreen, stream, socket.id+"1324@@");
        socket.emit('join-room', localStorage.getItem("code"), (socket.id + "1324@@"), (document.querySelector("#user_name").value) ? document.querySelector("#user_name").value : "Someone");
        socket.on('user-connected', userId => {
          if (userId.indexOf("1324@@") != -1) {
            return connectToNewUser(userId, stream, isScreen, userId)
          }
          connectToNewUser(userId, stream, "")
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
  socket.on("createMessage", (message, user, userId) => {
    if (userId.indexOf("1324@@") == -1) {
      let child = document.createElement("li");
      child.innerHTML = `<b>${user}</b><br/>${message}`
      document.querySelector("ul").appendChild(child);
      document.querySelector("ul").scrollIntoView(false);
    }
  })
})


document.querySelector(".leave_meeting").addEventListener("click", e => {
  // console.log("hello");
  var confirmationMessage = '\o/';
  (e || window.event).returnValue = confirmationMessage;
  if(confirmationMessage){
    socket.emit("disconnect", socket.id)
  }
  return confirmationMessage;

})

const remove_vid = (id) => {
  document.querySelectorAll(".user-screen").forEach(e => {
    console.log(e.classList, id);
    if (e.classList.contains(id) || e.classList.contains(id + "1324@@")) {
      console.log("user-left");
      document.querySelector("#video-grid").removeChild(e);
    }
  })
}
window.addEventListener("beforeunload", e => {
  socket.emit("exit", userId, localStorage.getItem("code"));
  var confirmationMessage = '\o/';
  (e || window.event).returnValue = confirmationMessage; // Gecko + IE
  return confirmationMessage;
  // e.preventDefault();
  // await emit_exit();
})
// const emit_exit = async () =>{
// }
socket.on("user-left", id => {
  console.log("hello");
  remove_vid(id)
})


socket.on('disconnect', userId => {
  // console.log("exit");
  socket.emit("exit", userId, localStorage.getItem("code"));
  // document.querySelectorAll(".user-screen").forEach(e => {
  //   if (userId == e.classList.contains(userId)) {
  //     videoGrid.removeChild(e);
  //   }
  // })
  // socket.emit("")
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




myPeer.on('open', id => {
  socket.emit('join-room', localStorage.getItem("code"), id, (document.querySelector("#user_name").value) ? document.querySelector("#user_name").value : "Someone");
})


function connectToNewUser(userId, stream, isScreen, id) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  if (isScreen != "") {
    video.style.width = "100%"
    video.style.height = "90%"
  }
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream, id)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

// const handeldrag = (e) => {
//   e.preventDefault();
//   e.target.style.width = Math.abs(e.layerX)
//   e.target.style.height = Math.abs(e.layerY)
//   console.log(e.toElement.scrollHeight);
// }

function addVideoStream(video, stream, userId) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  let video_text = document.createElement("span")
  video_text.textContent = document.querySelector("#user_name").value;
  let video_div = document.createElement("div");
  // video_div.ondrag = handeldrag;
  // video_div.draggable = "true";
  video_div.style.border = "5px solid transparent"
  video_div.className = "resize"
  video_div.classList.add("user-screen")
  let expand_icon = document.createElement("span");
  expand_icon.innerHTML = '<i class="fas fa-trash"></i>'
  expand_icon.className = "expand";
  video_text.classList.add("name");
  video_div.appendChild(video_text)
  video_div.appendChild(expand_icon)
  video_div.appendChild(video);
  video_div.style.position = "relative"
  video_div.classList.add(userId)
  videoGrid.prepend(video_div);
  // document.querySelectorAll(".resize").forEach(ele => {
  //   ele.addEventListener("mouseover", e => {
  //     e.stopPropagation();
  //     console.log("border");
  //     e.target.style.cursor = "crosshair";
  //   })
  //   console.log(ele);
  // })
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


/* server.js */




const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const path = require('path');
const mongo = require('./utils/database');
const router = require('./router/router');
const body = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const env = require('dotenv');
const io = require('socket.io')(server);
env.config();
const {
    ExpressPeerServer
} = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true,
})
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(body.urlencoded({
    extended: false
}))
app.use(express.static(path.join(__dirname, "public")));
app.set("views", "views");
app.set("view engine", "ejs");

app.use(flash());
app.use("/peerjs", peerServer);
let room;

io.on("connection", socket => {
    // The code to get socket ids
    let clients = io.sockets.clients().connected;
    let sockets = Object.values(clients);
    let users = sockets.map(s => s.id);
    console.log(users);

    socket.on("join-room", (roomid, userId, username) => {
        console.log(userId);
        socket.join(roomid);
        socket.to(roomid).broadcast.emit("user-connected", userId);
        socket.on("message", (message, user) => {
            io.to(roomid).emit("createMessage", message, user ,userId);
        });

        //     if (users.length > 1) {
        //         socket.to(users[0]).emit("join-request" ,username , userId);
        //         socket.on("status", grant => {
        //             console.log("status recieved");
        //             // if (grant == "allow") {
        //             // }
        //         });
        //     } else {
        //         socket.join(roomid);
        //         socket.to(roomid).broadcast.emit("user-connected", userId);
        //         socket.on("message", (message, user) => {
        //             io.to(roomid).emit("createMessage", message, user);
        //         })

        //     }
        // })
    })

    socket.on("exit" , (user , room) =>{
        console.log("user " , user );
        socket.to(room).emit("user-left" , user);
    })
    // socket.on("screen" , )
})
router.get("/", (req, res) => {
    res.redirect(`/signup`)
});


app.use("/", router);
mongo.connect(() => {
    server.listen(process.env.PORT || 3400, () => {
        console.log("The server is running at port 3400");
    });
});