const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name, 
    email,
    password: hashedPassword,
    role
  });

  res.json({ message: "User Registered" });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, name:user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Set cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    sameSite: "lax"
  });

  res.json({ message: "Login successful", role: user.role });
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

const { verifyToken } = require("../middleware/authMiddleware");

// PROTECTED ROUTE
router.get("/me", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  
  res.json({
    id: user.id,
    name:user.name,
    role: user.role,
    googleAccessToken: user.googleAccessToken
  });

});

module.exports = router;