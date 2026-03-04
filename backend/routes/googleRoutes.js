const express = require("express");
const oauth2Client = require("../config/googleAuth");
const { verifyToken } = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();


// ============================
// CONNECT GOOGLE ACCOUNT
// ============================

router.get("/connect", verifyToken, (req, res) => {

  const url = oauth2Client.generateAuthUrl({

    access_type: "offline",

    scope: [
      "https://www.googleapis.com/auth/calendar"
    ],

    prompt: "consent",

    state: req.user.id   // VERY IMPORTANT

  });

  res.redirect(url);

});


// ============================
// GOOGLE CALLBACK
// ============================

router.get("/callback", async (req, res) => {

  try {

    const code = req.query.code;
    const userId = req.query.state;

    const { tokens } = await oauth2Client.getToken(code);

    await User.findByIdAndUpdate(userId, {

      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token

    });
    
    res.redirect("http://localhost:5173/dashboard/employee?calendar=connected");

  } catch(err){

    console.error(err);
    res.send("Google Connection Failed");

  }

});

module.exports = router;