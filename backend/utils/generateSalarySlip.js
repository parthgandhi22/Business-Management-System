const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateSalarySlip(user, salaryData) {

  const dir = path.join(__dirname, "../salary_slips");

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const filePath = path.join(
    dir,
    `${user._id}-${salaryData.month}.pdf`
  );

  const doc = new PDFDocument({
    margin: 50
  });

  doc.pipe(fs.createWriteStream(filePath));

  // =========================
  // LOGO
  // =========================
  const logoPath = path.join(__dirname, "../assets/logo.png");

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 30, { width: 80 });
  }
  

  // =========================
  // HEADER
  // =========================

  doc
    .fontSize(24)
    .fillColor("#333")
    .text("CONSOLE BMS", { align: "center" });

  doc
    .fontSize(16)
    .fillColor("#555")
    .text("Salary Slip", { align: "center" });

  doc.moveDown(2);

  // =========================
  // EMPLOYEE DETAILS
  // =========================

  doc
    .fontSize(12)
    .fillColor("#000");

  doc.text(`Employee Name: ${user.name}`);
  doc.text(`Email: ${user.email}`);
  doc.text(`Role: ${user.role}`);
  doc.text(`Month: ${salaryData.month}`);

  doc.moveDown(2);

  // =========================
  // SALARY TABLE HEADER
  // =========================

  doc
    .fontSize(14)
    .text("Salary Breakdown", { underline: true });

  doc.moveDown();

  const baseSalary = salaryData.baseSalary;
  const bonus = salaryData.bonus;
  const deductions = salaryData.deductions;

  const netSalary =
    baseSalary + bonus - deductions;

  // =========================
  // TABLE CONTENT
  // =========================

  doc.fontSize(12);

  doc.text(`Base Salary`, 50, doc.y);
  doc.text(`₹ ${baseSalary}`, 400, doc.y);

  doc.moveDown();

  doc.text(`Bonus`, 50, doc.y);
  doc.text(`₹ ${bonus}`, 400, doc.y);

  doc.moveDown();

  doc.text(`Deductions`, 50, doc.y);
  doc.text(`₹ ${deductions}`, 400, doc.y);

  doc.moveDown();

  // =========================
  // LINE
  // =========================

  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke();

  doc.moveDown();

  // =========================
  // NET SALARY
  // =========================

  doc
    .fontSize(16)
    .fillColor("#0a7d28")
    .text(`Net Salary: ₹ ${netSalary}`, {
      align: "right"
    });

  doc.moveDown(2);

  // =========================
  // FOOTER
  // =========================

  doc
    .fontSize(10)
    .fillColor("#555")
    .text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      { align: "center" }
    );

  doc.end();

  return filePath;
}

module.exports = generateSalarySlip;