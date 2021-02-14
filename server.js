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
var ids = [];
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
io.on("connection", async socket => {
    // The code to get socket ids
    var db = mongo.getdb();
    let clients = io.sockets.clients().connected;
    let sockets = Object.values(clients);
    let users = sockets.map(s => s.id);
    ids = users
    socket.on('join-room-success', (roomid, peerid, socketId, username) => {
        socket.join(roomid);
        socket.to(roomid).emit("user-connected", peerid, socketId);
        socket.on("store-user", (streamId) => {
            console.log("store called");
            db.collection("session-id").insertOne({
                socketId: socketId,
                streamId: streamId
            }).then((result) => {
                console.log("user Inserted")
            }).catch((err) => {
                console.log(err);
            });
        })
        socket.on("message", (message, user) => {
            io.to(roomid).emit("createMessage", message, user);
        })
        socket.on("disconnect", () => {
            console.log(socket.id);
            db.collection("session-id").findOne({
                socketId: socket.id
            }).then((result) => {
                if (result) {
                    console.log(result.streamId);
                    socket.to(roomid).emit("user-disconnect", result.socketId, result.streamId);
                    db.collection("session-id").deleteOne({
                        streamId: result.streamId
                    }).then((result) => {
                        console.log("record removed");
                    }).catch((err) => {
                        console.log(err);
                    });
                } else {
                    console.log("no such record");
                }
            }).catch((err) => {
                console.log(err);
            });
        })
    })
    // socket.on("status", grant => {
    //     // console.log("status recieved");
    //     if (grant == "allow") {
    //     }
    // });
    // if (users.length > 1) {
    // }
    // console.log();
    // InsertRecord(socket.id ,streamId)
    // socket.on("store-user", info => {
    // })
    // socket.on("join-request", (roomcode, peerid) => {
    //     socket.to(users[0]).emit("join-room", peerid, socket.id);
    // })
    // socket.on("permission-allowed", (peerid, socketId) => {
    //     // console.log(roomid);
    //     console.log(ids[ids.length - 1], "here");
    //     socket.to(ids[(ids.length - 1)]).emit("now-connect-to-room", peerid, socketId);

    socket.on("screen-disconnect", (socketId, streamId, roomid) => {
        console.log(streamId + "here");
        // RemoveScreen(screensoc, socketId, streamId, roomid);
        db.collection("session-id").findOne({
            streamId: streamId
        }).then((result) => {
            ids = result;
            if (result) {
                console.log(result.socketId);
                socket.to(roomid).emit("user-disconnect", result.socketId, result.streamId);
                db.collection("session-id").deleteOne({
                    socketId: result.socketId
                }).then((result) => {
                    console.log("record removed");
                }).catch((err) => {
                    console.log(err);
                });
            } else {
                console.log("no such record");
            }
        }).catch((err) => {
            console.log(err);
        });
    })
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