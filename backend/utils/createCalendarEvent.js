const { google } = require("googleapis");
const oauth2Client = require("../config/googleAuth");
const User = require("../models/User");

async function createCalendarEvent(userId, task) {

  try {

    const user = await User.findById(userId);

    // If user hasn't connected calendar → skip
    if (!user || !user.googleAccessToken) {
      return;
    }

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    const calendar = google.calendar({
      version: "v3",
      auth: oauth2Client
    });

    await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: task.title,
        description: task.description,

        start: {
          dateTime: new Date(task.deadline).toISOString(),
          timeZone: "Asia/Kolkata"
        },

        end: {
          dateTime: new Date(task.deadline).toISOString(),
          timeZone: "Asia/Kolkata"
        }
      }
    });

    console.log("Calendar event created");

  } catch (err) {

    // Do NOT break task creation
    console.error("Calendar Error:", err.message);

  }

}

module.exports = createCalendarEvent;