const database = require('../utils/database').getdb;
class User{
    constructor(socketId , streamId) {
        this.socketId = socketId;
        this.streamId = streamId;
    }
    Insert(info){
        let db = database();
        db.collection("session-id").insertOne({
            socketId: info[0][0],
            streamId: info[0][1]
        }).then((result) => {
            console.log("user Inserted")
        }).catch((err) => {
            console.log(err);
        });
    }
}

module.exports = User;