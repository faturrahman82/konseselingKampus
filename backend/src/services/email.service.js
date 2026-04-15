const nodemailer = require('nodemailer');

// ── Konfigurasi Transporter Mailtrap ──
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT) || 2525,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Kirim email atur ulang kata sandi
 * @param {string} toEmail - Email penerima
 * @param {string} resetLink - URL atur ulang (misal: http://localhost:5173/atur-ulang-sandi?token=xxx)
 */
const sendResetPasswordEmail = async (toEmail, resetLink) => {
    const mailOptions = {
        from: `"UniCounsel" <${process.env.EMAIL_FROM || 'noreply@unicounsel.ac.id'}>`,
        to: toEmail,
        subject: '🔐 Atur Ulang Kata Sandi - UniCounsel',
        html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Atur Ulang Kata Sandi</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="background-color:#1e3a8a;border-radius:12px;width:52px;height:52px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                <span style="color:white;font-size:24px;">🛡️</span>
              </div>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#1e3a8a;">UniCounsel</h1>
              <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Sistem Pemesanan Konseling dan Konsultasi Universitas</p>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;padding:36px 40px;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
              <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;text-align:center;">
                Atur Ulang Kata Sandi
              </h2>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;">
                Kami menerima permintaan untuk mengatur ulang kata sandi akun UniCounsel Anda.
              </p>

              <p style="margin:0 0 8px;font-size:14px;color:#374151;">
                Klik tombol di bawah untuk membuat kata sandi baru. Tautan ini berlaku selama <strong>1 jam</strong>.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:28px 0;">
                <a href="${resetLink}"
                   style="display:inline-block;background-color:#1e3a8a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                  🔒 Atur Ulang Kata Sandi
                </a>
              </div>

              <!-- Warning box -->
              <div style="background-color:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:14px;margin:20px 0;">
                <p style="margin:0;font-size:13px;color:#92400e;">
                  ⚠️ Jika Anda tidak meminta perubahan kata sandi, abaikan email ini. Akun Anda tetap aman.
                </p>
              </div>

              <!-- Link fallback -->
              <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
                Tautan tidak bisa diklik? Salin dan tempel URL berikut ke browser Anda:
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#6b7280;text-align:center;word-break:break-all;">
                ${resetLink}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:20px;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                © 2026 Pusat Kesejahteraan Universitas · UniCounsel · Hak Cipta Dilindungi
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
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Reset password email sent to: ${toEmail}`);
};

/**
 * Kirim email notifikasi status appointment
 * @param {string} toEmail - Email mahasiswa
 * @param {'APPROVED'|'REJECTED'} status - Status appointment
 * @param {object} details - { studentName, counselorName, appointmentDate, startTime, endTime, meetingLink }
 */
const sendAppointmentEmail = async (toEmail, status, details) => {
    const isApproved = status === 'APPROVED';
    const emoji = isApproved ? '✅' : '❌';
    const statusLabel = isApproved ? 'DISETUJUI' : 'DITOLAK';
    const bgColor = isApproved ? '#dcfce7' : '#fee2e2';
    const borderColor = isApproved ? '#16a34a' : '#dc2626';
    const textColor = isApproved ? '#15803d' : '#b91c1c';

    const dateStr = details.appointmentDate
        ? new Date(details.appointmentDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '-';

    const timeStr = (details.startTime && details.endTime)
        ? `${new Date(details.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })} – ${new Date(details.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })} WIB`
        : '-';

    const mailOptions = {
        from: `"UniCounsel" <${process.env.EMAIL_FROM || 'noreply@unicounsel.ac.id'}>`,
        to: toEmail,
        subject: `${emoji} Janji Temu ${statusLabel} - UniCounsel`,
        html: `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f0f2f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f7;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <div style="background-color:#1e3a8a;border-radius:12px;width:52px;height:52px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
            <span style="color:white;font-size:24px;">🎓</span>
          </div>
          <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#1e3a8a;">UniCounsel</h1>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Sistem Konseling dan Konsultasi Universitas</p>
        </td></tr>

        <tr><td style="background-color:#ffffff;border-radius:16px;padding:36px 40px;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <div style="background-color:${bgColor};border:1px solid ${borderColor};border-radius:10px;padding:16px;text-align:center;margin-bottom:24px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:${textColor};">${emoji} Janji Temu ${statusLabel}</p>
          </div>

          <p style="margin:0 0 16px;font-size:14px;color:#374151;">Halo <strong>${details.studentName}</strong>,</p>
          <p style="margin:0 0 24px;font-size:14px;color:#374151;">
            ${isApproved
                ? `Janji temu Anda dengan <strong>${details.counselorName}</strong> telah <strong>disetujui</strong>. Berikut detail sesi Anda:`
                : `Mohon maaf, janji temu Anda dengan <strong>${details.counselorName}</strong> <strong>tidak dapat disetujui</strong> saat ini. Silakan pilih jadwal lain yang tersedia.`
            }
          </p>

          ${isApproved ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
            <tr style="background-color:#f9fafb;"><td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;width:40%;">Konselor</td>
            <td style="padding:12px 16px;font-size:13px;color:#111827;">${details.counselorName}</td></tr>
            <tr><td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;border-top:1px solid #e5e7eb;">Tanggal</td>
            <td style="padding:12px 16px;font-size:13px;color:#111827;border-top:1px solid #e5e7eb;">${dateStr}</td></tr>
            <tr style="background-color:#f9fafb;"><td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;border-top:1px solid #e5e7eb;">Waktu</td>
            <td style="padding:12px 16px;font-size:13px;color:#111827;border-top:1px solid #e5e7eb;">${timeStr}</td></tr>
            ${details.meetingLink ? `<tr><td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;border-top:1px solid #e5e7eb;">Link Meet</td>
            <td style="padding:12px 16px;font-size:13px;border-top:1px solid #e5e7eb;"><a href="${details.meetingLink}" style="color:#1e3a8a;">${details.meetingLink}</a></td></tr>` : ''}
          </table>
          <div style="text-align:center;margin:20px 0;">
            <a href="http://localhost:5173/mahasiswa/jadwal" style="display:inline-block;background-color:#1e3a8a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;">
              📅 Lihat Jadwal Saya
            </a>
          </div>` : `
          <div style="text-align:center;margin:20px 0;">
            <a href="http://localhost:5173/mahasiswa/cari-konselor" style="display:inline-block;background-color:#1e3a8a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;">
              🔍 Cari Jadwal Lain
            </a>
          </div>`}

        </td></tr>

        <tr><td align="center" style="padding-top:20px;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">
            © 2026 Pusat Kesejahteraan Universitas · UniCounsel · Hak Cipta Dilindungi
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Appointment ${status} email sent to: ${toEmail}`);
};

/**
 * Kirim email selamat datang ke konselor baru beserta kredensial login
 * @param {string} toEmail
 * @param {{ fullName, username, password }} details
 */
const sendWelcomeCounselorEmail = async (toEmail, details) => {
    const mailOptions = {
        from: `"UniCounsel Admin" <${process.env.EMAIL_FROM || 'noreply@unicounsel.ac.id'}>`,
        to: toEmail,
        subject: '🎉 Selamat Datang di UniCounsel — Akun Konselor Anda Telah Dibuat',
        html: `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f0f2f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f7;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <div style="background-color:#1e3a8a;border-radius:12px;width:52px;height:52px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
            <span style="color:white;font-size:24px;">🎓</span>
          </div>
          <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#1e3a8a;">UniCounsel</h1>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Sistem Konseling dan Konsultasi Universitas</p>
        </td></tr>

        <tr><td style="background-color:#ffffff;border-radius:16px;padding:36px 40px;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;text-align:center;">
            🎉 Selamat Datang, ${details.fullName}!
          </h2>
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;">
            Akun konselor Anda di platform UniCounsel telah berhasil dibuat oleh administrator.
          </p>

          <p style="margin:0 0 12px;font-size:14px;color:#374151;font-weight:600;">Gunakan informasi berikut untuk masuk:</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
            <tr style="background-color:#f9fafb;">
              <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;width:40%;">Email</td>
              <td style="padding:12px 16px;font-size:13px;color:#111827;font-weight:500;">${toEmail}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;border-top:1px solid #e5e7eb;">Username</td>
              <td style="padding:12px 16px;font-size:13px;color:#111827;font-weight:500;border-top:1px solid #e5e7eb;">${details.username}</td>
            </tr>
            <tr style="background-color:#fff7ed;">
              <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;border-top:1px solid #e5e7eb;">Password</td>
              <td style="padding:12px 16px;font-size:13px;color:#b45309;font-weight:700;border-top:1px solid #e5e7eb;letter-spacing:1px;">${details.password}</td>
            </tr>
          </table>

          <div style="background-color:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:14px;margin-bottom:24px;">
            <p style="margin:0;font-size:13px;color:#92400e;">
              ⚠️ Segera ganti password Anda setelah login pertama melalui menu <strong>Pengaturan → Keamanan Akun</strong>.
            </p>
          </div>

          <div style="text-align:center;">
            <a href="http://localhost:5173/login" style="display:inline-block;background-color:#1e3a8a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 32px;border-radius:10px;">
              🔑 Masuk Sekarang
            </a>
          </div>
        </td></tr>

        <tr><td align="center" style="padding-top:20px;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">
            © 2026 Pusat Kesejahteraan Universitas · UniCounsel · Hak Cipta Dilindungi
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Welcome counselor email sent to: ${toEmail}`);
};

module.exports = { sendResetPasswordEmail, sendAppointmentEmail, sendWelcomeCounselorEmail };


