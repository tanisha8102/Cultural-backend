import nodemailer from "nodemailer";

const sendEmail = async (to, subject, resetLink) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });

    const mailOptions = {
      from: `"CulturalLink" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
          <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Reset Your Password</h2>
            <p>We received a request to reset your password for your <b>CulturalLink</b> account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetLink}" style="display:inline-block; background:#007bff; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">
                Reset Password
              </a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: #f8f8f8; padding: 10px; border-radius: 5px;">
              <a href="${resetLink}" style="color:#007bff; text-decoration:none;">${resetLink}</a>
            </p>
            <p>If you didn’t request this, you can ignore this email.</p>
            <p>Thanks,<br>The CulturalLink Team</p>
            <p style="font-size:12px; color:#888; text-align:center;">&copy; 2025 CulturalLink. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Reset password email sent successfully.");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

export default sendEmail;
