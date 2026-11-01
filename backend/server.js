const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();


// إعداد الـ Middleware مع زيادة الحد الأقصى لحجم البيانات (لقبول صور الملف الشخصي بصيغة Base64)
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// استيراد المسارات (Routes)
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

// تفعيل المسارات
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// مسار تجريبي للتأكد من عمل السيرفر
app.get('/', (req, res) => {
  res.json({ message: 'نظام BuildTrack API يعمل بكفاءة عالية وبنجاح 🚀' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`السيرفر يعمل حالياً على المنفذ (Port): ${PORT}`);
});