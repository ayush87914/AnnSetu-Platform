const nodemailer = require('nodemailer');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
};

const sendOTPEmail = async (email, otp) => {
  await sendEmail(
    email,
    'AnnaSetu - OTP Verification',
    `<h2>Your OTP Code</h2><p>Your verification code is: <b style="font-size: 24px;">${otp}</b></p><p>This OTP is valid for 10 minutes.</p>`
  );
};

const sendPasswordResetOTP = async (email, otp) => {
  await sendEmail(
    email,
    'AnnaSetu - Password Reset Code',
    `<h2>Password Reset Request</h2><p>Your password reset code is: <b style="font-size: 24px;">${otp}</b></p><p>This code is valid for 10 minutes.</p>`
  );
};

const sendPasswordResetConfirmation = async (email, name) => {
  await sendEmail(
    email,
    'AnnaSetu - Password Changed Successfully',
    `<h2>Hi ${name},</h2><p>Your password has been reset successfully.</p>`
  );
};

const sendLoginAlert = async (email, name) => {
  await sendEmail(
    email,
    'AnnaSetu - New Login Detected',
    `<h2>Hi ${name},</h2><p>You have successfully logged in to your AnnaSetu account.</p>`
  );
};

const sendApprovalEmail = async (email, name) => {
  await sendEmail(
    email,
    'AnnaSetu - Account Approved! 🎉',
    `<h2>Congratulations, ${name}!</h2><p>Your application has been reviewed and accepted.</p>`
  );
};

const sendRejectionEmail = async (email, name) => {
  await sendEmail(
    email,
    'AnnaSetu - Application Update',
    `<h2>Hi ${name},</h2><p>We're sorry, your application was not approved at this time.</p>`
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