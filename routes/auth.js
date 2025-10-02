const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

// Show forgot password page
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
});

// Handle forgot password submission
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.send("No account with that email found.");

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL using environment BASE_URL
    const baseURL = process.env.BASE_URL;
    const resetUrl = `${baseURL}/reset-password/${token}`;

    // Send email
    await sendEmail(
      user.email,
      "Password Reset Request",
      `Hello ${user.username || ""},\n\nClick this link to reset your password:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`
    );

    res.send("Password reset link sent to your email.");
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.send("Something went wrong. Please try again later.");
  }
});

// Show reset password page
router.get("/reset-password/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.send("Token is invalid or expired.");

    res.render("reset-password", { token: req.params.token });
  } catch (err) {
    console.error("Reset Password GET Error:", err);
    res.send("Something went wrong. Please try again later.");
  }
});

// Handle reset password submission
router.post("/reset-password/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.send("Token is invalid or expired.");

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.send("Password has been reset successfully!");
  } catch (err) {
    console.error("Reset Password POST Error:", err);
    res.send("Something went wrong. Please try again later.");
  }
});

module.exports = router;
