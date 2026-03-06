const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");                // for socket
const { Server } = require("socket.io");     // for socket
require("dotenv").config();
require("./cron/payrollCron");

const AuthRoutes = require("./routes/authRoutes");
const TaskRoutes = require("./routes/taskRoutes2");
const UserRoutes = require("./routes/userRoutes");
const AuditRoutes = require("./routes/auditRoutes");
const GoogleRoutes = require("./routes/googleRoutes");
const PayrollRoutes = require("./routes/payrollRoutes");
const AnnouncementRoutes = require("./routes/announcementRoutes");
const MessageRoutes = require("./routes/messageRoutes");
// the below two routes are for testing in postman only, they are not used in the frontend
const SalaryRoutes = require("./routes/salaryRoutes");
const EmailRoutes = require("./routes/emailRoutes");

const app = express();


// CREATE HTTP SERVER (Required for Socket.io)
const server = http.createServer(app);

// SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

// Make socket accessible inside routes
app.set("io", io);

// ACTIVE USERS TRACKING
let activeUsers = [];

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("userOnline", (user) => {

    const existingUser = activeUsers.find(u => u.id === user.id);

    if(!existingUser){
      activeUsers.push({
        ...user,
        socketId: socket.id
      });
    }

    io.emit("activeUsers", activeUsers);
  });

  socket.on("disconnect", () => {

    activeUsers = activeUsers.filter(
      user => user.socketId !== socket.id
    );

    io.emit("activeUsers", activeUsers);

    console.log("User disconnected:", socket.id);
  });

});

// MIDDLEWARE
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(
  "/salary_slips",
  express.static(path.join(__dirname, "salary_slips"))
);

// ROUTES (UNCHANGED)
app.use("/api/auth", AuthRoutes);
app.use("/api/tasks", TaskRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/audit", AuditRoutes);
app.use("/api/google", GoogleRoutes);
app.use("/api/payroll", PayrollRoutes);
app.use("/api/admin", AnnouncementRoutes);
app.use("/api/messages", MessageRoutes);

// testing routes
app.use("/api/salary", SalaryRoutes);
app.use("/api/email", EmailRoutes);

// DB CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));



server.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);