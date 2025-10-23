const nodemailer = require("nodemailer");

exports.sendEmail = async ({ to, subject, text, attachments = [] }) => {
  console.log("📬 emailUtils.sendEmail called");
  console.log("   Recipients:", to);
  console.log("   Subject:", subject);

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  // Ensure 'to' is a comma-separated string (nodemailer requirement)
  const recipientString = Array.isArray(to) ? to.join(", ") : to;
  console.log("   Formatted recipients:", recipientString);

  const mailOptions = {
    from: process.env.EMAIL,
    to: recipientString,
    subject,
    html: text,
    attachments: attachments.length
      ? attachments.map((att) => ({
          filename: att.filename,
          path: att.path,
          contentType: att.contentType,
        }))
      : undefined, // Include attachments if provided
  };

  try {
    // Send the email using nodemailer
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    console.log("   Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    console.error("   Error code:", error.code);
    console.error("   Full error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
