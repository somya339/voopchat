const mongo = require('mongodb');
let _db;
exports.connect = (cb) => {
    mongo.connect(`mongodb+srv://somyagupta:${process.env.DATAKEY}@shop.xcr2h.mongodb.net/product`, {
        useUnifiedTopology: true
    }).then((result) => {
        console.log("Database connected.")
        _db = result.db();
        cb();
    }).catch((err) => {
        console.log(err);
    });
}
exports.getdb = () => {
    // console.log(_db);
    if (_db) {
        return _db;
    }
    throw "No Database Connected"
}