function salaryEmailTemplate(name, month, netSalary) {

  return `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px">

    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden">

      <div style="background:#1f2937; color:white; padding:20px; text-align:center">
        <h2 style="margin:0">CONSOLE BMS</h2>
        <p style="margin:0; font-size:13px">Business Management System</p>
      </div>

      <div style="padding:25px">

        <p>Dear <b>${name}</b>,</p>

        <p>
          Your salary slip for <b>${month}</b> has been generated successfully.
        </p>

        <div style="
            background:#f1f5f9;
            padding:15px;
            border-radius:6px;
            margin:20px 0;
            text-align:center;
        ">
          <h3 style="margin:0">Net Salary</h3>
          <h2 style="margin:5px 0; color:#16a34a">₹ ${netSalary}</h2>
        </div>

        <p>
          Please find your salary slip attached to this email.
        </p>

        <p style="margin-top:25px">
          If you have any questions regarding your salary or deductions,
          please contact the HR department.
        </p>

        <p>
          Regards,<br>
          <b>HR Department</b><br>
          CONSOLE BMS
        </p>

      </div>

      <div style="
          background:#f1f5f9;
          padding:15px;
          font-size:12px;
          text-align:center;
          color:#6b7280
      ">
        This is an automated email from CONSOLE BMS.<br>
        Please do not reply to this email.
      </div>

    </div>

  </div>
  `;
}

module.exports = { salaryEmailTemplate };