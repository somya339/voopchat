const router = require('express').Router();
const controller = require('../controllers/controller');

router.get("/signup", controller.getSignup);
router.post("/signup", controller.postSignup);
router.get("/login", controller.getlogin);
router.post("/login", controller.postLogin);
router.get("/otp", controller.getOtp);
router.post("/otp", controller.postOtp);
router.get("/home", controller.getHome);
router.post("/:room" , controller.postVideo);
module.exports = router;
