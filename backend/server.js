const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();
require("./cron/payrollCron");  // this can be used if auto we need to generate salary slips on a schedule, but for now we will generate them manually via the route

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

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true, 
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/salary_slips", express.static(path.join(__dirname, "salary_slips")));

// Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/tasks", TaskRoutes);
app.use("/api/users",UserRoutes);
app.use("/api/audit", AuditRoutes);
app.use("/api/google", GoogleRoutes);
app.use("/api/payroll", PayrollRoutes);
app.use("/api/admin", AnnouncementRoutes);
app.use("/api/messages", MessageRoutes);

app.use("/api/salary", SalaryRoutes);
app.use("/api/email", EmailRoutes);

// DB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);