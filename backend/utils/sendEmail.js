const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Food Donation Platform - OTP Verification',
    html: `
      <h2>Your OTP Code</h2>
      <p>Your verification code is: <b style="font-size: 24px;">${otp}</b></p>
      <p>This OTP is valid for 10 minutes.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;