const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const {saveRedirectUrl} = require("../middleware.js");
const userControllers = require("../controllers/users.js");

router.route("/signup")
.get(userControllers.renderSignupForm)
.post(wrapAsync(userControllers.signup));

router.route("/login")
.get(userControllers.renderLogin)
.post(saveRedirectUrl , passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}) ,
  userControllers.login);

  
router.get("/logout", userControllers.logout);

module.exports = router;