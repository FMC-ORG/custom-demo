import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RECIPIENT_EMAIL = 'federicomujica1@gmail.com';

function buildRenewalEmailHtml(fullName: string, email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1a1a1a; padding: 24px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #333333; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 32px 24px;">
              <div style="width: 48px; height: 4px; background-color: #FFD803; border-radius: 2px; margin-bottom: 24px;"></div>
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #ffffff;">
                Renew your car insurance
              </h1>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.9);">
                Hi ${fullName},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.9);">
                You've subscribed with ${email}. Don't let your car insurance lapse – compare quotes and renew in minutes.
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.9);">
                Get a quick quote and save on your renewal.
              </p>
              <a href="#" style="display: inline-block; padding: 14px 28px; background-color: #32A781; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                Renew car insurance
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.6);">
                Confused.com – Compare. Save. Insure.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';

    if (!fullName) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const html = buildRenewalEmailHtml(fullName, email);

    const { error } = await resend.emails.send({
      from: 'Confused.com <onboarding@resend.dev>',
      to: RECIPIENT_EMAIL,
      subject: `Car insurance renewal – ${fullName} subscribed`,
      html,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
