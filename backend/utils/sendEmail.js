const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Generic send function
const sendEmail = async (to, subject, html) => {
  await resend.emails.send({
    from: 'AnnaSetu <onboarding@resend.dev>',
    to,
    subject,
    html
  });
};

// OTP for registration
const sendOTPEmail = async (email, otp) => {
  await sendEmail(
    email,
    'AnnaSetu - OTP Verification',
    `
      <h2>Your OTP Code</h2>
      <p>Your verification code is: <b style="font-size: 24px;">${otp}</b></p>
      <p>This OTP is valid for 10 minutes.</p>
    `
  );
};

// Password reset OTP
const sendPasswordResetOTP = async (email, otp) => {
  await sendEmail(
    email,
    'AnnaSetu - Password Reset Code',
    `
      <h2>Password Reset Request</h2>
      <p>Your password reset code is: <b style="font-size: 24px;">${otp}</b></p>
      <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
    `
  );
};

// Password successfully reset confirmation
const sendPasswordResetConfirmation = async (email, name) => {
  await sendEmail(
    email,
    'AnnaSetu - Password Changed Successfully',
    `
      <h2>Hi ${name},</h2>
      <p>Your password has been reset successfully.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
    `
  );
};

// Login success alert
const sendLoginAlert = async (email, name) => {
  await sendEmail(
    email,
    'AnnaSetu - New Login Detected',
    `
      <h2>Hi ${name},</h2>
      <p>You have successfully logged in to your AnnaSetu account.</p>
      <p>If this wasn't you, please reset your password immediately.</p>
    `
  );
};

// Admin approval alert
const sendApprovalEmail = async (email, name) => {
  await sendEmail(
    email,
    'AnnaSetu - Account Approved! 🎉',
    `
      <h2>Congratulations, ${name}!</h2>
      <p>Your application has been reviewed and <b>accepted</b> by our team.</p>
      <p>You can now log in and start using AnnaSetu.</p>
    `
  );
};

// Admin rejection alert
const sendRejectionEmail = async (email, name) => {
  await sendEmail(
    email,
    'AnnaSetu - Application Update',
    `
      <h2>Hi ${name},</h2>
      <p>We're sorry to inform you that your application was not approved at this time.</p>
      <p>If you believe this is an error, please contact our support team.</p>
    `
  );
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetOTP,
  sendPasswordResetConfirmation,
  sendLoginAlert,
  sendApprovalEmail,
  sendRejectionEmail
};