/**
 * @file server/services/emailService.js
 * @description Email service using Resend API.
 * Handles sending transactional emails (password reset, order confirmations, etc.)
 * 
 * Setup:
 * 1. Sign up for free at https://resend.com (100 emails/day free tier)
 * 2. Get API key from https://resend.com/api-keys
 * 3. Add RESEND_API_KEY to your .env file
 * 4. Add and verify your sending domain in Resend dashboard (or use onboarding@resend.dev for testing)
 */

const { Resend } = require('resend');

// Lazy-initialize Resend client to avoid crashes when API key is not set
let resendClient = null;

/**
 * Get or create Resend client instance (lazy initialization)
 * @returns {Resend} Resend client instance
 * @throws {Error} If RESEND_API_KEY is not configured
 */
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured in environment variables');
  }
  
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  
  return resendClient;
}

/**
 * Send password reset email with reset link
 * @param {String} toEmail - Recipient email address
 * @param {String} resetURL - Password reset URL with token
 * @returns {Promise<Object>} Resend API response
 */
async function sendPasswordResetEmail(toEmail, resetURL) {
  try {
    // Validate inputs
    if (!toEmail || !resetURL) {
      throw new Error('Email address and reset URL are required');
    }

    // Log environment configuration for debugging
    console.log('[EMAIL CONFIG] RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);
    console.log('[EMAIL CONFIG] EMAIL_FROM:', process.env.EMAIL_FROM || 'using default (onboarding@resend.dev)');

    // Get Resend client (lazy initialization - only crashes if actually used)
    const resend = getResendClient();

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'K_M_Cart <onboarding@resend.dev>',
      to: [toEmail],
      subject: 'Reset Your K_M_Cart Password',
      html: getPasswordResetEmailHTML(resetURL),
      text: getPasswordResetEmailText(resetURL),
    });

    if (error) {
      console.error('[EMAIL ERROR] Resend API error:', JSON.stringify(error, null, 2));
      console.error('[EMAIL ERROR] Error details:', {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode
      });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('[EMAIL SUCCESS] Password reset email sent:', { 
      to: toEmail, 
      messageId: data?.id,
      timestamp: new Date().toISOString() 
    });

    return { success: true, messageId: data?.id };

  } catch (error) {
    console.error('[EMAIL ERROR] Email service error:', error.message);
    console.error('[EMAIL ERROR] Full error:', error);
    throw error;
  }
}

/**
 * Generate HTML email template for password reset
 * @param {String} resetURL - Password reset URL
 * @returns {String} HTML email content
 */
function getPasswordResetEmailHTML(resetURL) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #333;
      font-size: 22px;
      margin: 0 0 20px 0;
    }
    .content p {
      color: #555;
      font-size: 16px;
      margin: 0 0 20px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    .button:hover {
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      color: #999;
      font-size: 13px;
      margin: 5px 0;
    }
    .link-text {
      word-break: break-all;
      color: #667eea;
      font-size: 13px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <h2>Hello!</h2>
      <p>
        You recently requested to reset your password for your K_M_Cart account.
        Click the button below to reset it.
      </p>
      <div style="text-align: center;">
        <a href="${resetURL}" class="button">Reset Your Password</a>
      </div>
      <div class="info-box">
        <p>
          <strong>This link will expire in 15 minutes</strong> for security reasons.
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p class="link-text">${resetURL}</p>
    </div>
    <div class="footer">
      <p><strong>K_M_Cart</strong></p>
      <p>© ${new Date().getFullYear()} K_M_Cart. All rights reserved.</p>
      <p style="margin-top: 15px;">
        If you have any questions, please contact our support team.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email for password reset (fallback for non-HTML email clients)
 * @param {String} resetURL - Password reset URL
 * @returns {String} Plain text email content
 */
function getPasswordResetEmailText(resetURL) {
  return `
Reset Your K_M_Cart Password

Hello!

You recently requested to reset your password for your K_M_Cart account.
Click the link below to reset it:

${resetURL}

This link will expire in 15 minutes for security reasons.

If you didn't request this password reset, you can safely ignore this email.
Your password will remain unchanged.

---
K_M_Cart
© ${new Date().getFullYear()} K_M_Cart. All rights reserved.

If you have any questions, please contact our support team.
  `.trim();
}

module.exports = {
  sendPasswordResetEmail,
};
