const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail(to, subject, htmlContent, attachmentPath = null) {

  const mailOptions = {
    from: `"CONSOLE BMS HR" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    html: htmlContent
  };

  if (attachmentPath) {
    mailOptions.attachments = [
      {
        filename: "salary-slip.pdf",
        path: attachmentPath
      }
    ];
  }

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;