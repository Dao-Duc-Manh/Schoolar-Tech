const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password for Gmail
  },
});

// Verify on startup (optional)
transporter.verify((error, success) => {
  if (error) {
    logger.error('Email transporter error: %s', error);
  } else {
    logger.info('Email transporter ready');
  }
});

const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Scholar Tech" <noreply@scholartech.com>',
    to: user.email,
    subject: 'Welcome to Scholar Tech!',
    html: `
      <h1>Welcome ${user.fullName}!</h1>
      <p>Your account has been created successfully.</p>
      <p>Role: ${user.role}</p>
      <p>Get started by logging in at your dashboard.</p>
      <hr>
      <small>Scholar Tech Team</small>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send welcome email to ${user.email}: %s`, error);
    throw error;
  }
};

const sendResetPasswordEmail = async (email, resetToken) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Scholar Tech" <noreply@scholartech.com>',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <hr>
      <small>Scholar Tech Team</small>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Reset password email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send reset email to ${email}: %s`, error);
    throw error;
  }
};

const sendGradeNotification = async (studentEmail, gradeDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Scholar Tech" <noreply@scholartech.com>',
    to: studentEmail,
    subject: `New Grade Posted: ${gradeDetails.assessmentName}`,
    html: `
      <h1>New Grade Available</h1>
      <p><strong>${gradeDetails.assessmentName}</strong></p>
      <p>Score: ${gradeDetails.score}/${gradeDetails.maxScore} (${gradeDetails.percentage}%)</p>
      <p>Feedback: ${gradeDetails.feedback || 'N/A'}</p>
      <p>Check your dashboard for details.</p>
      <hr>
      <small>Scholar Tech Team</small>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Grade notification sent to ${studentEmail}`);
  } catch (error) {
    logger.error(`Failed to send grade notification: %s`, error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendGradeNotification,
};

