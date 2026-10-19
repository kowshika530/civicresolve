import fs from 'fs';
import path from 'path';
import nodemailer, { Transporter, TestAccount } from 'nodemailer';

export interface EmailConfig {
  provider: 'gmail' | 'custom' | 'ethereal';
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
}

const CONFIG_PATH = path.resolve(process.cwd(), 'data', 'email_config.json');

class EmailService {
  private cachedConfig: EmailConfig | null = null;
  private etherealAccount: TestAccount | null = null;

  constructor() {
    this.loadConfig();
  }

  public loadConfig(): EmailConfig {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
        this.cachedConfig = JSON.parse(data);
        return this.cachedConfig!;
      }
    } catch (err) {
      console.warn('[EmailService] Could not read email_config.json:', err);
    }

    // Fallback to environment variables
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromAddress = process.env.EMAIL_FROM || '"CivicResolve Portal" <noreply@civicresolve.tn.gov.in>';

    if (gmailUser && gmailPass) {
      this.cachedConfig = {
        provider: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        user: gmailUser,
        pass: gmailPass,
        from: fromAddress || gmailUser
      };
    } else if (smtpHost && smtpUser && smtpPass) {
      this.cachedConfig = {
        provider: 'custom',
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        user: smtpUser,
        pass: smtpPass,
        from: fromAddress
      };
    } else {
      this.cachedConfig = {
        provider: 'ethereal'
      };
    }

    return this.cachedConfig;
  }

  public saveConfig(config: EmailConfig): void {
    this.cachedConfig = config;
    try {
      const dir = path.dirname(CONFIG_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
      console.log('[EmailService] Saved email configuration successfully.');
    } catch (err) {
      console.error('[EmailService] Failed to write email_config.json:', err);
      throw err;
    }
  }

  public async getTransporter(): Promise<{ transporter: Transporter; isEthereal: boolean }> {
    const config = this.loadConfig();

    if (config.provider === 'gmail' && config.user && config.pass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.user,
          pass: config.pass
        }
      });
      return { transporter, isEthereal: false };
    }

    if (config.provider === 'custom' && config.host && config.user && config.pass) {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port || 587,
        secure: config.secure ?? (config.port === 465),
        auth: {
          user: config.user,
          pass: config.pass
        }
      });
      return { transporter, isEthereal: false };
    }

    // Default: use Ethereal for instant valid SMTP testing
    if (!this.etherealAccount) {
      this.etherealAccount = await nodemailer.createTestAccount();
      console.log('[EmailService] Generated Ethereal Test Account:', this.etherealAccount.user);
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: this.etherealAccount.user,
        pass: this.etherealAccount.pass
      }
    });

    return { transporter, isEthereal: true };
  }

  public async verifyConfig(config: EmailConfig): Promise<{ success: boolean; message: string }> {
    try {
      let transporter: Transporter;
      if (config.provider === 'gmail') {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: config.user,
            pass: config.pass
          }
        });
      } else if (config.provider === 'custom') {
        transporter = nodemailer.createTransport({
          host: config.host,
          port: config.port || 587,
          secure: config.secure ?? (config.port === 465),
          auth: {
            user: config.user,
            pass: config.pass
          }
        });
      } else {
        return { success: true, message: 'Ethereal test mode active.' };
      }

      await transporter.verify();
      return { success: true, message: 'SMTP credentials verified successfully! Email can now be sent to real recipients.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to authenticate with SMTP server.' };
    }
  }

  public async sendPasswordResetEmail(params: {
    to: string;
    userName: string;
    resetLink: string;
    tempPassword: string;
    token: string;
  }): Promise<{
    success: boolean;
    previewUrl?: string;
    messageId?: string;
    error?: string;
    isEthereal: boolean;
  }> {
    try {
      const { transporter, isEthereal } = await this.getTransporter();
      const config = this.loadConfig();
      const from = config.provider === 'gmail' && config.user
        ? `"CivicResolve Portal" <${config.user}>`
        : (config.from || (config.user ? `"CivicResolve Support" <${config.user}>` : '"CivicResolve Support" <noreply@civicresolve.tn.gov.in>'));

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CivicResolve Password Reset</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <tr>
      <td style="background-color: #132238; padding: 24px 32px; text-align: left;">
        <div style="color: #2dd4bf; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
          Government of Tamil Nadu • Municipal Redressal
        </div>
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">
          CivicResolve — Password Reset
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Hello <strong>${params.userName || 'Citizen/Officer'}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
          We received a request to reset your password for your <strong>CivicResolve Municipal Portal</strong> account (<span style="font-family: monospace; color: #0f172a;">${params.to}</span>).
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
            Temporary Recovery Access:
          </div>
          <div style="font-size: 14px; color: #1e293b; margin-bottom: 12px;">
            Your temporary access password:
            <span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 16px; font-weight: bold; margin-left: 8px;">${params.tempPassword}</span>
          </div>
          <div style="font-size: 13px; color: #64748b;">
            Security Reset Token: <code style="font-family: monospace; color: #0284c7; font-weight: bold;">${params.token}</code>
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${params.resetLink}" style="display: inline-block; background-color: #008C95; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 2px 4px rgba(0,140,149,0.25);">
            Reset Your Password Now &rarr;
          </a>
        </div>

        <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 0 0 16px;">
          If the button above does not work, copy and paste this URL into your browser:<br>
          <a href="${params.resetLink}" style="color: #008C95; word-break: break-all;">${params.resetLink}</a>
        </p>

        <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin: 24px 0 0; border-top: 1px solid #e2e8f0; pt: 16px;">
          If you did not request this password reset, please ignore this email or contact the Municipal Redressal Helpline at <strong>1913</strong>. Your account remains safe.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
        CivicResolve • Integrated Municipal Administration Grievance Redressal System • Government of Tamil Nadu
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const textContent = `
CivicResolve - Password Reset Request
Government of Tamil Nadu • Municipal Redressal

Hello ${params.userName || 'Citizen/Officer'},

We received a request to reset your password for your CivicResolve account (${params.to}).

Temporary Password: ${params.tempPassword}
Security Reset Token: ${params.token}

Reset Link: ${params.resetLink}

If you did not request this reset, you can safely ignore this email.
Helpline: 1913
      `;

      const info = await transporter.sendMail({
        from,
        to: params.to,
        subject: '[CivicResolve] Password Reset Request for your Account',
        text: textContent,
        html: htmlContent
      });

      console.log(`[EmailService] Sent password reset email to ${params.to}. MessageId: ${info.messageId}`);
      let previewUrl: string | undefined;
      if (isEthereal) {
        previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        console.log(`[EmailService] Ethereal Preview URL: ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl,
        isEthereal
      };
    } catch (err: any) {
      console.error('[EmailService] Failed to send email:', err);
      return {
        success: false,
        error: err.message || 'Failed to dispatch email.',
        isEthereal: false
      };
    }
  }
}

export const emailService = new EmailService();
