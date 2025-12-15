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
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    <div style="background: #000000;">
        <!-- Use a table as main container - better dark mode support -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#000000">
            <tr>
                <td align="center" style="padding: 60px 20px;" bgcolor="#000000">
                    
                    <!-- Inner content table -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px;" bgcolor="#000000">
                        <tr>
                            <td align="center" style="padding: 40px 20px;" bgcolor="#000000">
                                
                                <!-- Stars as text/emojis instead of CSS gradients -->
                                <div style="position: relative; padding: 20px 0;">
                                    <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0;">✨ ⭐ ✨ ⭐ ✨ ⭐ ✨ ⭐ ✨</p>
                                </div>
                                
                                <!-- Title -->
                                <h1 style="
                                    margin: 30px 0;
                                    font-size: 28px;
                                    font-weight: bold;
                                    color: #a855f7;
                                    line-height: 1.4;
                                ">
                                    🌟 Your message has found its match! 🌟
                                </h1>

                                <!-- Button -->
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 30px auto;">
                                    <tr>
                                        <td align="center" style="border-radius: 8px;" bgcolor="#a855f7">
                                            <a href="https://vybrix.app/receive" style="
                                                display: inline-block;
                                                color: #000000;
                                                background-color: #a855f7;
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

                                <!-- Stars bottom -->
                                <div style="position: relative; padding: 20px 0;">
                                    <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0;">⭐ ✨ ⭐ ✨ ⭐ ✨ ⭐ ✨ ⭐</p>
                                </div>

                                <!-- Footer -->
                                <p style="
                                    margin: 30px 0 0 0;
                                    color: #ffffff;
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
