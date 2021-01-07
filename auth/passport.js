const local = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
exports.initalize = (passport , userEmail , userId) => {
    const authenticate = async (email, password, done) => {
        const user = userEmail(email)
        if (user == null) {
            return done(null, false, {
                message: "no user found"
            })
        }
        try{
            if(await bcrypt.compare(password)){
                return done(null,user);
            }else{
                return done(null, false, {
                    message: "Password incorrect"
                })
            }
        }catch(e){
        done(e);
        }
    }
    passport.use(new local({
        usernameField: "email"
    }, authenticate))
    passport.serializeUser((user, done) => {
        done(null , user.id);
    })
    passport.deserializeUser((id, done) => {
       return done(null, userId(id))
    })
}