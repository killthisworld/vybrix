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
      subject: '✨ Your resonance has arrived',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
                background: #000000;
              }
              .wrapper {
                width: 100%;
                background: #000000;
                padding: 40px 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #1a0b2e 0%, #16082b 50%, #0d0221 100%);
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(169, 92, 255, 0.3);
              }
              .header {
                text-align: center;
                padding: 50px 30px 30px;
                background: radial-gradient(circle at 50% 0%, rgba(169, 92, 255, 0.15), transparent 70%);
                position: relative;
              }
              .stars {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 100px;
                opacity: 0.6;
              }
              .star {
                position: absolute;
                width: 2px;
                height: 2px;
                background: white;
                border-radius: 50%;
              }
              h1 {
                background: linear-gradient(90deg, #5CF6E8 0%, #A95CFF 50%, #FF5BDA 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-size: 36px;
                font-weight: 700;
                margin: 0 0 15px 0;
                position: relative;
                z-index: 1;
              }
              .subtitle {
                color: #CBA6FF;
                font-size: 16px;
                margin: 0;
                opacity: 0.9;
              }
              .message-box {
                margin: 40px 30px;
                background: rgba(0, 0, 0, 0.4);
                border: 2px solid rgba(169, 92, 255, 0.3);
                border-radius: 16px;
                padding: 30px;
                position: relative;
                overflow: hidden;
              }
              .message-box:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #5CF6E8, #A95CFF, #FF5BDA);
              }
              .message-text {
                color: #FFFFFF;
                font-size: 18px;
                line-height: 1.7;
                margin: 0;
                font-style: italic;
              }
              .quote-mark {
                color: #A95CFF;
                font-size: 48px;
                line-height: 0;
                opacity: 0.3;
                position: absolute;
                top: 20px;
                left: 20px;
              }
              .cta-container {
                text-align: center;
                padding: 0 30px 50px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #00D4FF 0%, #A95CFF 50%, #FF5BDA 100%);
                color: white;
                padding: 18px 48px;
                border-radius: 12px;
                text-decoration: none;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 10px 30px rgba(169, 92, 255, 0.4);
                transition: transform 0.2s;
              }
              .button:hover {
                transform: translateY(-2px);
              }
              .footer {
                text-align: center;
                padding: 30px;
                border-top: 1px solid rgba(169, 92, 255, 0.2);
                margin: 0 30px;
              }
              .footer-text {
                color: #A95CFF;
                font-size: 13px;
                line-height: 1.6;
                margin: 0 0 10px 0;
              }
              .signature {
                color: #6B4BA1;
                font-size: 14px;
                font-style: italic;
                margin: 15px 0 0 0;
              }
              @media only screen and (max-width: 600px) {
                .wrapper {
                  padding: 20px 10px;
                }
                h1 {
                  font-size: 28px;
                }
                .message-box {
                  margin: 30px 20px;
                  padding: 25px;
                }
                .message-text {
                  font-size: 16px;
                }
                .button {
                  padding: 16px 36px;
                  font-size: 15px;
                }
              }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <div class="container">
                <div class="header">
                  <div class="stars">
                    <div class="star" style="top: 15px; left: 10%;"></div>
                    <div class="star" style="top: 25px; left: 25%;"></div>
                    <div class="star" style="top: 40px; left: 45%;"></div>
                    <div class="star" style="top: 20px; left: 65%;"></div>
                    <div class="star" style="top: 35px; left: 80%;"></div>
                    <div class="star" style="top: 50px; left: 90%;"></div>
                  </div>
                  <h1>✨ Your Match Has Arrived</h1>
                  <p class="subtitle">A soul across the ether resonates with your frequency</p>
                </div>
                
                <div class="message-box">
                  <span class="quote-mark">"</span>
                  <p class="message-text">${receiverMessage.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                </div>
                
                <div class="cta-container">
                  <a href="${appUrl}/receive?token=${token}" class="button">
                    View Your Resonance ✨
                  </a>
                </div>
                
                <div class="footer">
                  <p class="footer-text">
                    This message found you because your emotional frequency aligned<br>
                    with someone across the planet
                  </p>
                  <p class="signature">— The VYBRIX Collective</p>
                </div>
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
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: #000000;
              }
              .wrapper {
                width: 100%;
                background: #000000;
                padding: 40px 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #1a0b2e 0%, #16082b 50%, #0d0221 100%);
                border-radius: 20px;
                padding: 60px 40px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(169, 92, 255, 0.3);
              }
              .emoji {
                font-size: 80px;
                margin: 0 0 30px 0;
                animation: glow 2s ease-in-out infinite;
              }
              @keyframes glow {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
              }
              h1 {
                background: linear-gradient(90deg, #5CF6E8, #A95CFF, #FF5BDA);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-size: 32px;
                font-weight: 700;
                margin: 0 0 20px 0;
              }
              .message {
                color: #CBA6FF;
                font-size: 18px;
                line-height: 1.6;
                margin: 0 0 30px 0;
              }
              .sub-message {
                color: #A95CFF;
                font-size: 16px;
                margin: 0 0 40px 0;
              }
              .signature {
                color: #6B4BA1;
                font-size: 14px;
                font-style: italic;
                margin: 0;
              }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <div class="container">
                <div class="emoji">✨</div>
                <h1>Someone Felt Seen</h1>
                <p class="message">
                  Your message resonated deeply with<br>
                  someone across the void today
                </p>
                <p class="sub-message">
                  Your words created connection
                </p>
                <p class="signature">— The VYBRIX Collective</p>
              </div>
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
