
const cron = require("node-cron");

const User = require("../models/User");
const SalarySlip = require("../models/SalarySlip");

const generateSalarySlip = require("../utils/generateSalarySlip");


// For testing, we can set it to run every 30 seconds
//cron.schedule("*/30 * * * * *", async () => {

// Runs at midnight on the 1st of every month
cron.schedule("0 0 1 * *", async () => {
  
  console.log("Running payroll cron job...");

  const employees = await User.find({ role: "employee" });

  const month = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  for (let emp of employees) {

    // prevent duplicates
    const existing = await SalarySlip.findOne({
      employee: emp._id,
      month
    });

    if (existing) continue;

    const salaryData = {

      baseSalary: 60000,
      bonus: 5000,
      deductions: 2000,
      month

    };

    const filePath = generateSalarySlip(emp, salaryData);

    await SalarySlip.create({

      employee: emp._id,
      month,
      filePath

    });

  }

  console.log("Salary slips generated");

});