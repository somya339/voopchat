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
        socket.join(roomid);
        socket.to(roomid).broadcast.emit("user-connected", userId);
        socket.on("message", (message, user) => {
            io.to(roomid).emit("createMessage", message, user);
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