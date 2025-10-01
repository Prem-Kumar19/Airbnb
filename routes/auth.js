const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

// 1️⃣ Show forgot password page
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
});

// 2️⃣ Handle forgot password form submission
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.send("No account with that email found.");

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetUrl = `http://localhost:3000/reset-password/${token}`;
  await sendEmail(user.email, "Password Reset", `Click here to reset: ${resetUrl}`);

  res.send("Password reset link sent to your email.");
});

// 3️⃣ Show reset password page
router.get("/reset-password/:token", async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.send("Token is invalid or expired.");

  res.render("reset-password", { token: req.params.token });
});

// 4️⃣ Handle reset password submission
router.post("/reset-password/:token", async (req, res) => {
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
});

module.exports = router;
