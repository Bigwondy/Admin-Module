import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export const emailService = {
  async sendWelcomeEmail(userEmail, password) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Providus Bank Admin <onboarding@resend.dev>',
        to: [userEmail],
        subject: 'Welcome to Providus Bank Admin Portal',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to Providus Bank</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 20px; background: linear-gradient(135deg, #2E434E 0%, #1a2930 100%); border-radius: 8px 8px 0 0;">
                          <h1 style="margin: 0; color: #FDB813; font-size: 28px; font-weight: 700;">Providus Bank</h1>
                          <p style="margin: 8px 0 0; color: #ffffff; font-size: 16px;">Admin Portal</p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 24px; font-weight: 600;">Welcome to the Team!</h2>
                          <p style="margin: 0 0 24px; color: #64748b; font-size: 16px; line-height: 1.6;">
                            Your account has been created and approved. You can now access the Providus Bank Admin Portal using the credentials below.
                          </p>
                          
                          <!-- Credentials Box -->
                          <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0;">
                            <p style="margin: 0 0 12px; color: #475569; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Login Credentials</p>
                            
                            <div style="margin-bottom: 16px;">
                              <p style="margin: 0 0 4px; color: #64748b; font-size: 12px;">Email Address</p>
                              <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600; font-family: monospace;">${userEmail}</p>
                            </div>
                            
                            <div>
                              <p style="margin: 0 0 4px; color: #64748b; font-size: 12px;">Temporary Password</p>
                              <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600; font-family: monospace; background-color: #ffffff; padding: 8px 12px; border-radius: 4px; border: 1px solid #e2e8f0;">${password}</p>
                            </div>
                          </div>
                          
                          <!-- CTA Button -->
                          <div style="text-align: center; margin: 32px 0;">
                            <a href="${window.location.origin}" style="display: inline-block; background-color: #FDB813; color: #1e293b; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                              Access Admin Portal
                            </a>
                          </div>
                          
                          <!-- Security Notice -->
                          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                              <strong>🔒 Security Reminder:</strong> Please change your password after your first login. Keep your credentials secure and never share them with anyone.
                            </p>
                          </div>
                          
                          <p style="margin: 24px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                            If you have any questions or need assistance, please contact your system administrator.
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
                          <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                            © ${new Date().getFullYear()} Providus Bank. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
      }

      console.log('Email sent successfully:', data);
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: error.message };
    }
  }
};
