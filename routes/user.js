const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const {saveRedirectUrl} = require("../middleware.js");
const userControllers = require("../controllers/users.js");

// ---------------- SIGNUP ----------------
router.route("/signup")
.get(userControllers.renderSignupForm)
.post(wrapAsync(userControllers.signup));

// ---------------- LOGIN ----------------
router.route("/login")
.get(userControllers.renderLogin)
.post(saveRedirectUrl , passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}) ,
  userControllers.login);

 // ---------------- LOGOUT ---------------- 
router.get("/logout", userControllers.logout);

// ---------------- FORGOT PASSWORD ----------------
router.route("/forgot-password")
  .get(userControllers.renderForgotPassword)
  .post(wrapAsync(userControllers.forgotPassword));

  // ---------------- RESET PASSWORD ----------------
router.route("/reset-password/:token")
  .get(userControllers.renderResetPassword)
  .post(wrapAsync(userControllers.resetPassword));

module.exports = router;