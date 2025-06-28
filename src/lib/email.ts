import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
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

export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    return { success: true };
  } catch (error) {
    console.error('Email connection failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 