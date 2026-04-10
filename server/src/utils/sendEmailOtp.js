import sgMail from "@sendgrid/mail";
import config from "../config/config.js";

sgMail.setApiKey(config.sendGridApiKey);

export const sendEmailOtp = async (toEmail, otp) => {
  const msg = {
    to: toEmail,
    from: config.emailFrom,
    subject: "Your verification OTP",
    text: `Your OTP is ${otp}. It will expire in ${config.otpExpiryMinutes} minutes.`,
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log("✅ OTP email sent, status:", response.statusCode);
    return response;
  } catch (error) {
    console.error("❌ SendGrid error:", error.response?.body?.errors);
    throw error;
  }
};

export const sendWelcomeEmail = async (toEmail, name) => {
  const msg = {
    to: toEmail,
    from: config.emailFrom,
    subject: "Welcome to Digital Census!",
    text: `Hi ${name},\n\nWelcome to Digital Census! We're excited to have you on board.\n\nTo get started, please verify your email using the OTP we'll send you shortly.\n\nIf you have any questions, feel free to reach out to our support team.\n\nBest regards,\nThe Digital Census Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Welcome to Digital Census, ${name}! 🎉</h2>
        <p style="color: #555;">We're excited to have you on board.</p>
        <p style="color: #555;">To get started, please verify your email using the OTP we'll send you shortly.</p>
        <p style="color: #555;">If you have any questions, feel free to reach out to our support team.</p>
        <br/>
        <p style="color: #555;">Best regards,<br/><strong>The Digital Census Team</strong></p>
      </div>
    `,
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log("✅ Welcome email sent, status:", response.statusCode);
    return response;
  } catch (error) {
    console.error("❌ SendGrid welcome email error:", error.response?.body?.errors);
    // Don't throw — welcome email failure should not block registration
  }
};