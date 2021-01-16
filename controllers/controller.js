const mail = require('nodemailer');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
//https://www.google.com/settings/security/lesssecureapps 
const signup = require('../model/model');
let otp;
exports.getSignup = (req, res) => {
    res.render("index", {
        req: req,
        err: req.flash("err"),
        auth: req.flash("unauthorised"),
        username: req.flash("User_Name_Exist") || "",
        available: req.flash("User_Email_Exist") || ""
    });
}

exports.postCheck = (req, res) => {
    signup.getName(req.body.username, result => {
        if (result == null) {
            return res.render("index", {
                username: req.body.username,
                available: "The user Name is unique!"
            });
        }
        return res.render("index", {
            username: "",
            available: "oops! The username already exist."
        })
    })
}

exports.postSignup = (req, res) => {
    signup.fetch(req.body.email, req.body.username, (result) => {
        // console.log(result);
        if (result == "1") {
            req.flash("User_Name_Exist", "The Username is already taken.");
            res.redirect("/signup");
        } else if (result == null) {
            // console.log(process.env.EMAIL , req.body.email);
            otp = Math.floor(Math.random() * 2000 + Math.random() * 2000 + Math.random() * 2000 + Math.random() * 2000 + Math.random() * 2000 + 4).toString();
            if (otp.length < 4) {
                otp = "0" + otp;
            }
            let details;
            console.log(otp);
            let transporter = mail.createTransport({
                host: "smtp.gmail.com",
                service: "gmail",
                port: 465,
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            })
            let mailoptions = {
                from: process.env.EMAIL,
                to: `${req.body.email}`,
                subject: "VOOP Chat",
                html: `<p>Your OTP is</p> ${otp}`
            };
            setTimeout(() => {
                otp = "";
            }, 200000);
            transporter.sendMail(mailoptions, (err, data) => {
                if (err) {
                    // console.log(data);
                    // console.log(err);
                } else {
                    console.log("MAIL sent!");
                }
            });
            bcrypt.hash(req.body.password, 12, (err, result) => {
                // res.locals.session_code = result;
                const model = new signup(req.body.username, req.body.email, result, otp);
                model.save();
            })
            req.session.isLoggedIn = otp;
            res.redirect("/otp");
        } else if (result == 2) {
            req.flash("User_Email_Exist", "The Email is already registered");
            res.redirect("/signup");
        }
    })
}
exports.getOtp = (req, res) => {
    if (req.session.isLoggedIn) {
        return res.render("otp", {
            code: req.session.isLoggedIn
        })
    }
    req.flash("unauthorised", "You need to Either Signup or Login");
    res.redirect("/signup");
}

exports.postOtp = (req, res) => {
    if (otp == req.body.otp) {
        res.redirect("/login");
    } else {
        signup.delete_cred(req.body.code);
        req.flash("err", "the otp is wrong");
        res.redirect("/signup");
    }
}


exports.getlogin = (req, res) => {
    res.render("login", {
        err: req.flash("login"),
    });
}
exports.postLogin = (req, res) => {
    // console.log(req.body.username);
    let password = req.body.password
    signup.check_cred(req.body.username, (result) => {
        if (result) {
            bcrypt.compare(password, result.password, (err, compared) => {
                if (compared == false) {
                    req.flash("login", "Your Name Or Password Is In Correct");
                    return res.redirect("/login");
                } else {
                    req.session.isLoggedIn = true;
                    req.session.name = req.body.username;
                    return res.redirect("/home");
                }
            })
        } else {
            req.flash("login", "Your Name Or Password Is In Correct")
            return res.redirect("/login");
        }
    })
}
exports.postVideo = (req, res) => {
    if (req.session.isLoggedIn) {
        user = req.body.user
        return res.render("room", {
            roomId: req.params.rooms,
            name: req.session.name,
            user: user
        });
    }
    req.flash("unauthorised", "You need to Either Signup or Login");
    res.redirect("/signup");
}


exports.getHome = (req, res) => {

    res.render("home", {
        name: req.session.name,
        uuid: uuidv4()
    })
}