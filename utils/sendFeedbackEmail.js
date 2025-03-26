import nodemailer from "nodemailer";

const sendFeedbackEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: `"Feedback System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Feedback email sent successfully to", to);
  } catch (error) {
    console.error("❌ Error sending feedback email:", error);
  }
};

export default sendFeedbackEmail;
