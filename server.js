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
env.config();
console.log(process.env.SECRET);
app.use(session({
        secret: process.env.SECRET,
        resave: false,
    saveUninitialized: false
}))
app.use(body.urlencoded({
    extended: false
}))
const io = require('socket.io')(server);
const {
    ExpressPeerServer
} = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true,
})

app.use("/peerjs", peerServer);
let room;

io.on("connection", socket => {
    socket.on("join-room", (roomid, userId) => {
        socket.join(roomid);
        socket.to(roomid).broadcast.emit("user-connected", userId);
        socket.on("message", (message, user) => {
            io.to(roomid).emit("createMessage", message, user);
        })
    })
})



app.use(express.static(path.join(__dirname, "public")));
app.set("views", "views");
app.set("view engine", "ejs");

app.use(flash());

router.get("/", (req, res) => {
    res.redirect(`/signup`)
});


app.use("/", router);
mongo.connect(() => {
    server.listen(process.env.PORT || 3400, () => {
        console.log("the server is running at port 3400");
    });
});