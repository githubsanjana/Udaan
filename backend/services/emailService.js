const nodemailer = require('nodemailer')

function getTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

function verifyEmail() {
  const t = getTransporter()
  t.verify((err) => {
    if (err) console.log('❌ Email service error:', err.message)
    else console.log('✅ Email service ready!')
  })
}

const sendWelcomeEmail = async (name, email) => {
  try {
    await getTransporter().sendMail({
      from:    `"✦ Udaan" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: '🎉 Welcome to Udaan — Your Financial Journey Begins!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#07080f;color:#e2e8f0;padding:40px;border-radius:16px;">
          <h1 style="background:linear-gradient(135deg,#6366f1,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;">✦ Udaan</h1>
          <h2 style="color:#e2e8f0;">Welcome, ${name}! 👋</h2>
          <p style="color:#94a3b8;line-height:1.6;">Your account has been created. Start your financial literacy journey!</p>
          <div style="background:#161929;border:1px solid #1c2038;border-radius:12px;padding:24px;margin:24px 0;">
            <h3 style="color:#818cf8;">🚀 Get Started</h3>
            <ul style="color:#94a3b8;line-height:2;">
              <li>📚 Complete your first lesson — earn +80 XP</li>
              <li>🛡️ Try the Fraud Detector</li>
              <li>🔥 Build a daily streak</li>
            </ul>
          </div>
          <p style="color:#475569;font-size:12px;text-align:center;">© 2024 Udaan Financial Literacy Platform</p>
        </div>
      `,
    })
    console.log(`✅ Welcome email sent to ${email}`)
  } catch (err) {
    console.log('❌ Welcome email failed:', err.message)
  }
}

const sendFraudAlertEmail = async (name, email, merchant, riskScore, amount) => {
  try {
    await getTransporter().sendMail({
      from:    `"✦ Udaan Security" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `🚨 High Risk Transaction Detected — ${riskScore}% Risk`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#07080f;color:#e2e8f0;padding:40px;border-radius:16px;">
          <h1 style="background:linear-gradient(135deg,#6366f1,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;">✦ Udaan</h1>
          <div style="background:#ef444420;border:1px solid #ef444440;border-radius:12px;padding:24px;margin-bottom:24px;">
            <h2 style="color:#ef4444;margin-top:0;">🚨 Suspicious Transaction!</h2>
            <p style="color:#94a3b8;">Hi ${name}, we detected a high-risk transaction.</p>
          </div>
          <div style="background:#161929;border:1px solid #1c2038;border-radius:12px;padding:24px;">
            <h3 style="color:#818cf8;margin-top:0;">Transaction Details</h3>
            <p style="color:#94a3b8;"><strong style="color:#e2e8f0;">Merchant:</strong> ${merchant}</p>
            <p style="color:#94a3b8;"><strong style="color:#e2e8f0;">Amount:</strong> ₹${amount}</p>
            <p style="color:#ef4444;"><strong>Risk Score: ${riskScore}% — HIGH RISK</strong></p>
          </div>
          <div style="background:#f59e0b20;border:1px solid #f59e0b40;border-radius:12px;padding:16px;margin-top:16px;">
            <p style="color:#f59e0b;margin:0;"><strong>⚠️ Do NOT proceed. Call 1930 if unauthorized.</strong></p>
          </div>
          <p style="color:#475569;font-size:12px;text-align:center;margin-top:32px;">© 2024 Udaan</p>
        </div>
      `,
    })
    console.log(`✅ Fraud alert sent to ${email}`)
  } catch (err) {
    console.log('❌ Fraud alert failed:', err.message)
  }
}

const sendWeeklyReport = async (name, email, stats) => {
  try {
    await getTransporter().sendMail({
      from:    `"✦ Udaan" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: '📊 Your Weekly Udaan Progress Report',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#07080f;color:#e2e8f0;padding:40px;border-radius:16px;">
          <h1 style="background:linear-gradient(135deg,#6366f1,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;">✦ Udaan</h1>
          <h2 style="color:#e2e8f0;">Hi ${name}! Your week in review 📈</h2>
          <div style="background:#161929;border:1px solid #6366f130;border-radius:12px;padding:20px;text-align:center;margin:16px 0;">
            <div style="font-size:32px;font-weight:900;color:#818cf8;">${stats.xpEarned} XP</div>
            <div style="color:#94a3b8;">Earned this week</div>
          </div>
          <div style="background:#161929;border:1px solid #22d3ee30;border-radius:12px;padding:20px;text-align:center;margin:16px 0;">
            <div style="font-size:32px;font-weight:900;color:#22d3ee;">${stats.lessonsCompleted}</div>
            <div style="color:#94a3b8;">Lessons completed</div>
          </div>
          <div style="background:#161929;border:1px solid #f59e0b30;border-radius:12px;padding:20px;text-align:center;margin:16px 0;">
            <div style="font-size:32px;font-weight:900;color:#f59e0b;">${stats.streak} 🔥</div>
            <div style="color:#94a3b8;">Day streak</div>
          </div>
          <p style="color:#475569;font-size:12px;text-align:center;margin-top:32px;">© 2024 Udaan</p>
        </div>
      `,
    })
    console.log(`✅ Weekly report sent to ${email}`)
  } catch (err) {
    console.log('❌ Weekly report failed:', err.message)
  }
}

const sendDailyReminder = async (name, email, streak) => {
  try {
    await getTransporter().sendMail({
      from:    `"✦ Udaan" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `🔔 Daily Reminder — Keep your ${streak > 0 ? streak + '-day' : ''} streak alive!`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#07080f;color:#e2e8f0;padding:40px;border-radius:16px;">
          <h1 style="background:linear-gradient(135deg,#6366f1,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;">✦ Udaan</h1>
          <h2 style="color:#e2e8f0;">Hey ${name}! 👋</h2>
          <p style="color:#94a3b8;">You haven't completed a lesson today. Don't break your streak!</p>
          ${streak > 0 ? `
          <div style="background:#f59e0b20;border:1px solid #f59e0b40;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
            <div style="font-size:48px;">🔥</div>
            <div style="font-size:32px;font-weight:900;color:#f59e0b;">${streak} Day Streak</div>
            <div style="color:#94a3b8;">Complete a lesson to keep it alive!</div>
          </div>` : ''}
          <p style="color:#475569;font-size:12px;text-align:center;margin-top:32px;">© 2024 Udaan · Turn off in Profile Settings</p>
        </div>
      `,
    })
    console.log(`✅ Daily reminder sent to ${email}`)
  } catch (err) {
    console.log('❌ Daily reminder failed:', err.message)
  }
}

const sendOtpEmail = async (name, email, otp) => {
  try {
    await getTransporter().sendMail({
      from:    `"✦ Udaan" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: '🔐 Your Udaan Password Reset OTP',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#07080f;color:#e2e8f0;padding:40px;border-radius:16px;">
          <h1 style="background:linear-gradient(135deg,#6366f1,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;">✦ Udaan</h1>
          <h2 style="color:#e2e8f0;">Hi ${name}! 👋</h2>
          <p style="color:#94a3b8;">Your password reset OTP is:</p>
          <div style="background:#161929;border:1px solid #6366f130;border-radius:12px;padding:32px;text-align:center;margin:24px 0;">
            <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#818cf8;">${otp}</div>
          </div>
          <p style="color:#94a3b8;">This OTP is valid for <strong style="color:#e2e8f0;">10 minutes</strong>.</p>
          <p style="color:#475569;font-size:12px;">If you didn't request this, ignore this email.</p>
          <p style="color:#475569;font-size:12px;text-align:center;margin-top:32px;">© 2024 Udaan</p>
        </div>
      `,
    })
    console.log(`✅ OTP email sent to ${email}`)
  } catch (err) {
    console.log('❌ OTP email failed:', err.message)
  }
}

module.exports = { sendWelcomeEmail, sendFraudAlertEmail, sendWeeklyReport, sendDailyReminder, verifyEmail, sendOtpEmail }