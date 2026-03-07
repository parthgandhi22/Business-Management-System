const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html, filePath, pdfBuffer) => {

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  };

  if (pdfBuffer) {

    mailOptions.attachments = [
      {
        filename: "salary-slip.pdf",
        content: pdfBuffer
      }
    ];

  } else if (filePath) {

    mailOptions.attachments = [
      {
        path: filePath
      }
    ];

  }

  await transporter.sendMail(mailOptions);

};

module.exports = sendEmail;