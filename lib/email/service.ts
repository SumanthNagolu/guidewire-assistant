import { Resend } from 'resend';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type EmailResult = {
  success: boolean;
  error?: string;
};

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@guidewire-training.com';

let resendClient: Resend | null = null;

if (resendApiKey) {
  resendClient = new Resend(resendApiKey);
}

/**
 * Send an email using Resend API
 * Falls back to console logging if RESEND_API_KEY is not configured (development mode)
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  if (!payload.to || !payload.subject || !payload.html) {
    return {
      success: false,
      error: 'Missing required email fields (to, subject, html)',
    };
  }

  // Development mode: log to console instead of sending
  if (!resendClient) {
    console.log('📧 Email (Development Mode - Not Sent):');
    console.log('  To:', payload.to);
    console.log('  Subject:', payload.subject);
    console.log('  HTML:', payload.html.substring(0, 200) + '...');
    
    return {
      success: true,
    };
  }

  // Production mode: send via Resend
  try {
    await resendClient.emails.send({
      from: fromEmail,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    return {
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown email error';
    console.error('Failed to send email:', message);
    
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Generate HTML for stalled learner reminder email
 */
export function generateStalledLearnerEmail(params: {
  firstName: string | null;
  appUrl: string;
}): { subject: string; html: string; text: string } {
  const name = params.firstName ?? 'there';
  const subject = 'Keep your learning momentum going! 🚀';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Guidewire Training Platform</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1f2937; margin-top: 0;">Hi ${name}! 👋</h2>
    
    <p style="font-size: 16px; color: #4b5563;">
      We noticed you haven't completed any topics recently. Don't let your progress slip away!
    </p>
    
    <p style="font-size: 16px; color: #4b5563;">
      Every topic you complete brings you one step closer to landing your dream Guidewire role. 
      Remember: <strong>consistency beats intensity</strong>.
    </p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; font-size: 16px; color: #1f2937;">
        💡 <strong>Quick wins:</strong>
      </p>
      <ul style="margin: 10px 0; padding-left: 20px; color: #4b5563;">
        <li>Watch just one video today (15-30 minutes)</li>
        <li>Ask the AI mentor a question about your last topic</li>
        <li>Review your progress dashboard to see how far you've come</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${params.appUrl}/dashboard" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Continue Learning →
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      You're receiving this because you opted in to learning reminders. 
      <a href="${params.appUrl}/dashboard" style="color: #667eea; text-decoration: none;">Manage your preferences</a>
    </p>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hi ${name}!

We noticed you haven't completed any topics recently. Don't let your progress slip away!

Every topic you complete brings you one step closer to landing your dream Guidewire role. Remember: consistency beats intensity.

Quick wins:
• Watch just one video today (15-30 minutes)
• Ask the AI mentor a question about your last topic
• Review your progress dashboard to see how far you've come

Continue Learning: ${params.appUrl}/dashboard

---
You're receiving this because you opted in to learning reminders.
Manage your preferences: ${params.appUrl}/dashboard
  `.trim();

  return { subject, html, text };
}

