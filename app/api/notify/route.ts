import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');
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
</head>
<body style="margin: 0; padding: 0;">
    <!-- Use a 1x1 black pixel as background -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==') repeat; background-color: #000000;">
        <tr>
            <td align="center" style="padding: 60px 20px;">
                
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            
                            <!-- Stars -->
                            <p style="color: rgba(255,255,255,0.4); font-size: 16px; margin: 0 0 20px 0;">✨ ⭐ ✨ ⭐ ✨ ⭐ ✨ ⭐ ✨</p>
                            
                            <!-- Title -->
                            <h1 style="
                                margin: 20px 0 30px 0;
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
                                    <td align="center" style="border-radius: 8px; background-color: #a855f7;">
                                        <a href="https://vybrix.app/receive" style="
                                            display: inline-block;
                                            color: #000000;
                                            text-decoration: none;
                                            padding: 16px 40px;
                                            font-size: 18px;
                                            font-weight: 600;
                                        ">
                                            Click to view your message
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Stars -->
                            <p style="color: rgba(255,255,255,0.4); font-size: 16px; margin: 30px 0 20px 0;">⭐ ✨ ⭐ ✨ ⭐ ✨ ⭐ ✨ ⭐</p>

                            <!-- Footer -->
                            <p style="
                                margin: 20px 0 0 0;
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
export const dynamic = 'force-dynamic';
