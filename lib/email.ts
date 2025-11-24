import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMatchNotification(
  email: string,
  token: string,
  receiverMessage: string
) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vybrix.onrender.com';
    
    await resend.emails.send({
      from: 'VYBRIX <onboarding@resend.dev>',
      to: email,
      subject: '✨ Your frequency match is ready',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: #000000;
                color: #ffffff;
                padding: 40px 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #1a0b2e 0%, #0d0221 100%);
                border-radius: 16px;
                padding: 40px;
                border: 1px solid rgba(169, 92, 255, 0.3);
              }
              h1 {
                background: linear-gradient(90deg, #5CF6E8, #A95CFF, #FF5BDA);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-size: 32px;
                margin-bottom: 20px;
              }
              .preview {
                background: rgba(169, 92, 255, 0.1);
                border-left: 4px solid #A95CFF;
                padding: 20px;
                margin: 30px 0;
                border-radius: 8px;
                font-style: italic;
                color: #CBA6FF;
              }
              .button {
                display: inline-block;
                background: linear-gradient(90deg, #00D4FF, #A95CFF);
                color: white;
                padding: 16px 32px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid rgba(169, 92, 255, 0.2);
                color: #A95CFF;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Your Match Has Arrived</h1>
              <p style="font-size: 18px; color: #CBA6FF;">
                Someone across the ether has resonated with your frequency.
              </p>
              
              <div class="preview">
                "${receiverMessage.substring(0, 100)}${receiverMessage.length > 100 ? '...' : ''}"
              </div>
              
              <p>Click below to view your full resonant message:</p>
              
              <a href="${appUrl}/receive?token=${token}" class="button">
                View Your Match ✨
              </a>
              
              <div class="footer">
                <p>— The VYBRIX Collective</p>
                <p style="font-size: 12px; color: #6B4BA1;">
                  This message found you because your emotional frequency aligned with someone across the planet.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    
    console.log(`✅ Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error);
    return false;
  }
}

export async function sendResonanceFeedback(email: string) {
  try {
    await resend.emails.send({
      from: 'VYBRIX <onboarding@resend.dev>',
      to: email,
      subject: '✨ Someone felt seen by your words',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: #000000;
                color: #ffffff;
                padding: 40px 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #1a0b2e 0%, #0d0221 100%);
                border-radius: 16px;
                padding: 40px;
                border: 1px solid rgba(169, 92, 255, 0.3);
                text-align: center;
              }
              h1 {
                background: linear-gradient(90deg, #5CF6E8, #A95CFF, #FF5BDA);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-size: 32px;
                margin-bottom: 20px;
              }
              .emoji {
                font-size: 64px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="emoji">✨</div>
              <h1>Someone Felt Seen</h1>
              <p style="font-size: 18px; color: #CBA6FF;">
                Your message resonated deeply with someone today.
              </p>
              <p style="color: #A95CFF; margin-top: 30px;">
                Your words created connection across the void.
              </p>
              <p style="font-size: 14px; color: #6B4BA1; margin-top: 40px;">
                — The VYBRIX Collective
              </p>
            </div>
          </body>
        </html>
      `,
    });
    
    console.log(`✅ Resonance feedback sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send feedback to ${email}:`, error);
    return false;
  }
}
