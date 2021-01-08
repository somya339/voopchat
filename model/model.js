const database = require('../utils/database').getdb;

class signup {
    constructor(name, email, password, code) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.session_code = code;
    }
    save() {
        let db = database();
        db.collection("DSC_Test_base").insertOne(this).then((result) => {
            console.log("inserted")
        }).catch((err) => {
            console.log(err);
        });
    }

    static getName(name, cb) {
        let db = database();
        db.collection("DSC_test_base").findOne({
            name: name
        }).then(result => {
            return cb(result);
        }).catch(err => {
            console.log(err);
        })
    }

    static fetch(email ,name , cb) {
        let db = database();
         db.collection("DSC_Test_base").findOne({
            name : name
        }).then( (result) => {
            if(result){
               return cb(1);
            }
            db.collection("DSC_Test_base").findOne({
                email : email
            }).then( response =>{
                if(response){
                    return cb(2);
                }
                cb(result);
            })
        }).catch((err) => {
            console.log(err);
        });
    }
    static check_cred(name, cb) {
        let db = database();
        db.collection("DSC_Test_base").findOne({
            name: name
        }).then((result) => {
            cb(result)
        }).catch((err) => {
            console.log(err);
        });
    }
    static delete_cred(code) {
        let db = database();
        db.collection("DSC_Test_base").deleteOne({
            session_code: code
        }).then((result) => {
            console.log(result);
        }).catch(err => {
            console.log(err);
        })
    }
};

module.exports = signup;