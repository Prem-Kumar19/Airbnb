const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    try{
  const { username, email, password } = req.body; 
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, err=>{
            if(err) return next(err);
             req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        });
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }    
};

module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req,res)=>{
    req.flash("success" ,"welcome to wanderlust! You are logged in");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
      if (err) { 
        return next(err);
       }
        req.flash("success", "You have logged out!");
        res.redirect("/listings");
    });
  };

// ---------------- FORGOT PASSWORD ----------------
module.exports.renderForgotPassword = (req, res) => {
    res.render("users/forgot-password.ejs");
};

module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.send("No account with that email found.");

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
   const resetUrl = `${process.env.BASE_URL}/reset-password/${token}`;

    await sendEmail(user.email, "Password Reset", `Click here to reset your password: ${resetUrl}`);

    res.send("Password reset link sent to your email.");
};

// ---------------- RESET PASSWORD ----------------
module.exports.renderResetPassword = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.send("Token is invalid or expired.");

    res.render("users/reset-password.ejs", { token: req.params.token });
};

module.exports.resetPassword = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.send("Token is invalid or expired.");

    user.setPassword(req.body.password, async (err) => {
        if (err) return res.send("Error resetting password.");

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.send("Password has been reset successfully! You can now login.");
    });
};

