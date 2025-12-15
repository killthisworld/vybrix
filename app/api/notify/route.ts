import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Vybrix <onboarding@resend.dev>',
      to: [email],
      subject: '🌟 Your message has found its match!',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light">
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #000000 !important;
        }
        /* Force dark mode email clients to keep black background */
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #000000 !important;
            }
            .email-container {
                background-color: #000000 !important;
            }
        }
        /* Gmail dark mode override */
        u + .body .email-container {
            background-color: #000000 !important;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;" class="body">
    <div style="background-color: #000000; margin: 0; padding: 0;" class="email-container">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #000000 !important; margin: 0; padding: 0;">
            <tr>
                <td align="center" style="padding: 60px 20px; background-color: #000000 !important;">
                    
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #000000 !important; position: relative;">
                        <tr>
                            <td style="
                                text-align: center; 
                                padding: 40px 20px;
                                background-color: #000000 !important;
                                background-image: 
                                    radial-gradient(2px 2px at 20% 30%, white, transparent),
                                    radial-gradient(2px 2px at 60% 70%, white, transparent),
                                    radial-gradient(1px 1px at 50% 50%, white, transparent),
                                    radial-gradient(1px 1px at 80% 10%, white, transparent),
                                    radial-gradient(2px 2px at 90% 60%, white, transparent),
                                    radial-gradient(1px 1px at 33% 80%, white, transparent),
                                    radial-gradient(2px 2px at 15% 15%, white, transparent),
                                    radial-gradient(1px 1px at 70% 40%, white, transparent),
                                    radial-gradient(2px 2px at 25% 90%, white, transparent),
                                    radial-gradient(1px 1px at 95% 85%, white, transparent);
                                background-size: 100% 100%;
                            ">
                                
                                <h1 style="
                                    margin: 0 0 50px 0;
                                    font-size: 32px;
                                    font-weight: bold;
                                    color: #a855f7 !important;
                                    line-height: 1.4;
                                ">
                                    🌟 Your message has found its match! 🌟
                                </h1>

                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                                    <tr>
                                        <td style="
                                            border-radius: 8px;
                                            background-color: #a855f7 !important;
                                        ">
                                            <a href="https://vybrix.app/receive" style="
                                                display: block;
                                                color: #000000 !important;
                                                text-decoration: none;
                                                padding: 16px 40px;
                                                font-size: 18px;
                                                font-weight: 600;
                                                border-radius: 8px;
                                            ">
                                                Click to view your message
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                                <p style="
                                    margin: 50px 0 0 0;
                                    color: #ffffff !important;
                                    font-size: 14px;
                                    opacity: 0.7;
                                ">
                                    Vybrix - Cosmic connections, one message at a time
                                </p>

                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
      `,
      text: `🌟 Your message has found its match! 🌟

Click here to view your message:
https://vybrix.app/receive

---
Vybrix - Cosmic connections, one message at a time`
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
