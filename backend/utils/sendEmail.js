// const pool = require('../config/db'); // تأكد من أن مسار الـ pool صحيح حسب هيكلية مشروعك
// const nodemailer = require('nodemailer');

// const sendLowStockAlert = async (productName, currentQuantity, minStockLevel) => {
//   try {
//     // 1. جلب إيميلات جميع الأدمنز من قاعدة البيانات
//     const adminsResult = await pool.query("SELECT email FROM users WHERE role = 'admin'");
//     const adminEmails = adminsResult.rows.map(admin => admin.email);

//     if (adminEmails.length === 0) {
//       console.log('⚠️ لا يوجد مديرين (Admins) مسجلين لإرسال التنبيه.');
//       return;
//     }

//     // 2. إنشاء الناقل لخدمة Gmail
//    const transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 587,
//       secure: false,
//       auth: {
//         user: 'amroshwaiat@gmail.com',
//         pass: 'lqbndvdsnanwxbtz'
//       },
//       tls: {
//         rejectUnauthorized: false
//       },
//       connectionTimeout: 10000, // مهلة زمنية 10 ثوانٍ
//       socketTimeout: 10000
//     });
//     const mailOptions = {
//       from: '"BuildTrack System" <amroshwaiat@gmail.com>',
//       to: adminEmails.join(', '), // دمج جميع إيميلات الأدمنز بفاصلة لترسل لهم دفعة واحدة
//       subject: `⚠️ تنبيه انخفاض المخزون: ${productName}`,
//       html: `
//         <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
//           <h2 style="color: #d9534f;">تنبيه: وصل المنتج إلى الحد الأدنى!</h2>
//           <p><strong>اسم المنتج:</strong> ${productName}</p>
//           <p><strong>الكمية الحالية:</strong> ${currentQuantity}</p>
//           <p><strong>الحد الأدنى المطلوب:</strong> ${minStockLevel}</p>
//           <hr/>
//           <p style="font-size: 12px; color: #777;">تم إرسال هذا الإشعار تلقائياً لجميع مديري نظام BuildTrack لإدارة المخزون.</p>
//         </div>
//       `
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log('✅ تم إرسال إشعار انخفاض المخزون لجميع الأدمنز بنجاح:', adminEmails);
//   } catch (err) {
//     console.error('❌ خطأ تفصيلي في إرسال البريد:', err);
//   }
// };

// module.exports = sendLowStockAlert;
const { Resend } = require('resend');
const pool = require('../config/db'); // تأكد من مسار الاتصال بقاعدة البيانات لديك
const resend = new Resend(process.env.RESEND_API_KEY);

const sendLowStockAlert = async (productName, currentStock, minStock) => {
  try {
    // 1. جلب إيميلات جميع الآدمنية من قاعدة البيانات
    const adminsResult = await pool.query("SELECT email FROM users WHERE role = 'admin'");
    const adminEmails = adminsResult.rows.map(row => row.email);

    if (adminEmails.length === 0) {
      console.log('⚠️ لا يوجد مسؤولون (Admins) مسجلون لإرسال الإشعار.');
      return;
    }

    // 2. إرسال البريد لجميع الآدمنية دفعة واحدة
    const data = await resend.emails.send({
      from: 'BuildTrack System <onboarding@resend.dev>', // أو الدومين الخاص بك بعد توثيقه
      to: adminEmails, // مصفوفة تحوي إيميلات جميع الآدمنية المستخرجين من قاعدة البيانات
      subject: `⚠️ تنبيه: انخفاض المخزون لمنتج ${productName}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #d9534f;">⚠️ تنبيه انخفاض المخزون</h2>
          <p>عذراً، وصل المنتج التالي إلى الحد الأدنى:</p>
          <ul>
            <li><strong>اسم المنتج:</strong> ${productName}</li>
            <li><strong>الكمية الحالية:</strong> ${currentStock}</li>
            <li><strong>الحد الأدنى المطلوب:</strong> ${minStock}</li>
          </ul>
          <p>يرجى إعادة تعبئة المخزون في أقرب وقت ممكن عبر نظام BuildTrack.</p>
        </div>
      `
    });

    console.log('✅ تم إرسال إشعار المخزون بنجاح لجميع الآدمنية:', data);
  } catch (error) {
    console.error('❌ خطأ تفصيلي في إرسال البريد:', error.message);
  }
};

module.exports = sendLowStockAlert;