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
const xss = require("xss-clean");
const morgan = require('morgan');
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
app.use(morgan('tiny'));

// app.use(xss());
app.use(flash());
app.use("/peerjs", peerServer);
let room;

io.on("connection", socket => {
    var db = mongo.getdb();

    // The code to get socket ids
    let clients = io.sockets.clients().connected;
    let sockets = Object.values(clients);
    let users = sockets.map(s => s.id);
    console.log(users);

    socket.on("join-room", (roomid, peerid, socketId, username) => {
        socket.join(roomid);
        socket.to(roomid).broadcast.emit("user-connected", peerid, socketId, username);
        socket.on("message", (message, user) => {
            io.to(roomid).emit("createMessage", message, user);
        });
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
        socket.on("screen-disconnect", (socketId, streamId, roomid) => {
            console.log("disconnect-detected");
            socket.to(roomid).emit("remove-screen", streamId);
        })
        socket.on("disconnect", () => {
            console.log(socket.id);
            // var ids;
            // RemoveStream(socket, roomid);
            db.collection("session-id").findOne({
                socketId: socket.id
            }).then((result) => {
                // ids = result;
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