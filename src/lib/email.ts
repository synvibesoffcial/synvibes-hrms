import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: true,
  logger: true,
});

export interface InvitationEmailData {
  recipientEmail: string;
  recipientName?: string;
  inviterName: string;
  role: string;
  invitationToken: string;
  companyName?: string;
}

export async function sendInvitationEmail(data: InvitationEmailData) {
  const {
    recipientEmail,
    recipientName,
    inviterName,
    role,
    invitationToken,
    companyName = 'Synvibes HRMS'
  } = data;

  const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${invitationToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitation to Join ${companyName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 10px 10px;
          border: 1px solid #e9ecef;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
          transition: background-color 0.3s;
        }
        .button:hover {
          background: #5a6fd8;
        }
        .info-box {
          background: white;
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid #667eea;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #6c757d;
          font-size: 14px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 You're Invited!</h1>
        <p>Welcome to ${companyName}</p>
      </div>
      
      <div class="content">
        <h2>Hello${recipientName ? ` ${recipientName}` : ''}!</h2>
        
        <p>Great news! <strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> as a <strong>${role}</strong>.</p>
        
        <div class="info-box">
          <h3>📋 Your Role Details</h3>
          <p><strong>Position:</strong> ${role}</p>
          <p><strong>Invited by:</strong> ${inviterName}</p>
          <p><strong>Company:</strong> ${companyName}</p>
        </div>
        
        <p>To accept this invitation and set up your account, click the button below:</p>
        
        <div style="text-align: center;">
          <a href="${invitationUrl}" class="button">Accept Invitation</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace;">
          ${invitationUrl}
        </p>
        
        <p><strong>⏰ Important:</strong> This invitation will expire in 7 days. Please accept it as soon as possible.</p>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our HR team.</p>
        
        <p>We're excited to have you join our team!</p>
        
        <p>Best regards,<br>
        <strong>The ${companyName} Team</strong></p>
      </div>
      
      <div class="footer">
        <p>This is an automated email from ${companyName}. Please do not reply to this email.</p>
        <p>If you did not expect this invitation, you can safely ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    You're Invited to Join ${companyName}!
    
    Hello${recipientName ? ` ${recipientName}` : ''}!
    
    ${inviterName} has invited you to join ${companyName} as a ${role}.
    
    To accept this invitation and set up your account, visit:
    ${invitationUrl}
    
    This invitation will expire in 7 days.
    
    If you have any questions, please contact our HR team.
    
    Best regards,
    The ${companyName} Team
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${companyName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Invitation to Join ${companyName} as ${role}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export interface VerificationEmailData {
  recipientEmail: string;
  recipientName: string;
  verificationToken: string;
  companyName?: string;
}

export async function sendVerificationEmail(data: VerificationEmailData) {
  const {
    recipientEmail,
    recipientName,
    verificationToken,
    companyName = 'Synvibes HRMS'
  } = data;

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - ${companyName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 10px 10px;
          border: 1px solid #e9ecef;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
          transition: background-color 0.3s;
        }
        .button:hover {
          background: #5a6fd8;
        }
        .info-box {
          background: white;
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid #667eea;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #6c757d;
          font-size: 14px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✉️ Verify Your Email</h1>
        <p>Welcome to ${companyName}</p>
      </div>
      
      <div class="content">
        <h2>Hello ${recipientName}!</h2>
        
        <p>Thank you for signing up with <strong>${companyName}</strong>! To complete your registration and secure your account, please verify your email address.</p>
        
        <div class="info-box">
          <h3>🔐 Why verify your email?</h3>
          <ul>
            <li>Secure your account access</li>
            <li>Receive important notifications</li>
            <li>Enable password recovery options</li>
          </ul>
        </div>
        
        <p>Click the button below to verify your email address:</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace;">
          ${verificationUrl}
        </p>
        
        <p><strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
        
        <p>If you didn't create an account with us, please ignore this email.</p>
        
        <p>Best regards,<br>
        <strong>The ${companyName} Team</strong></p>
      </div>
      
      <div class="footer">
        <p>This is an automated email from ${companyName}. Please do not reply to this email.</p>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Verify Your Email - ${companyName}
    
    Hello ${recipientName}!
    
    Thank you for signing up with ${companyName}! Please verify your email address to complete your registration.
    
    Click the link below to verify your email:
    ${verificationUrl}
    
    This verification link will expire in 24 hours.
    
    If you didn't create an account with us, please ignore this email.
    
    Best regards,
    The ${companyName} Team
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${companyName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Verify Your Email - ${companyName}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export interface PasswordResetEmailData {
  recipientEmail: string;
  recipientName: string;
  resetToken: string;
  companyName?: string;
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData) {
  const {
    recipientEmail,
    recipientName,
    resetToken,
    companyName = 'Synvibes HRMS'
  } = data;

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - ${companyName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 10px 10px;
          border: 1px solid #e9ecef;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
          transition: background-color 0.3s;
        }
        .button:hover {
          background: #5a6fd8;
        }
        .warning-box {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-left: 4px solid #fdcb6e;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #6c757d;
          font-size: 14px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔐 Reset Your Password</h1>
        <p>${companyName}</p>
      </div>
      
      <div class="content">
        <h2>Hello ${recipientName}!</h2>
        
        <p>We received a request to reset the password for your <strong>${companyName}</strong> account associated with this email address.</p>
        
        <p>If you made this request, click the button below to reset your password:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace;">
          ${resetUrl}
        </p>
        
        <div class="warning-box">
          <h3>⚠️ Important Security Information</h3>
          <ul>
            <li><strong>This link expires in 1 hour</strong> for your security</li>
            <li>If you didn't request this password reset, please ignore this email</li>
            <li>Your password will remain unchanged until you create a new one</li>
            <li>For security, we recommend using a strong, unique password</li>
          </ul>
        </div>
        
        <p>If you didn't request a password reset, you can safely ignore this email. Your account security has not been compromised.</p>
        
        <p>Best regards,<br>
        <strong>The ${companyName} Security Team</strong></p>
      </div>
      
      <div class="footer">
        <p>This is an automated security email from ${companyName}. Please do not reply to this email.</p>
        <p>If you need assistance, please contact our support team.</p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Reset Your Password - ${companyName}
    
    Hello ${recipientName}!
    
    We received a request to reset the password for your ${companyName} account.
    
    If you made this request, click the link below to reset your password:
    ${resetUrl}
    
    This link expires in 1 hour for your security.
    
    If you didn't request this password reset, please ignore this email.
    
    Best regards,
    The ${companyName} Security Team
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${companyName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Reset Your Password - ${companyName}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    return { success: true };
  } catch (error) {
    console.error('Email connection failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 