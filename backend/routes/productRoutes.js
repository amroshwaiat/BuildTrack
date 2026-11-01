const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const sendLowStockAlert = require('../utils/sendEmail');
// 1. جلب كافة المنتجات (متاح للجميع: Admin + Staff)
router.get('/', verifyToken, async (req, res) => {
  try {
    const products = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(products.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. إضافة منتج جديد (Admin فقط)
router.post('/', verifyAdmin, async (req, res) => {
  const { sku, name, category, quantity, min_stock_level, price, job_site } = req.body;
  try {
    const newProduct = await pool.query(
      `INSERT INTO products (sku, name, category, quantity, min_stock_level, price, job_site)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [sku, name, category, quantity, min_stock_level, price, job_site]
    );
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// 3. عملية الصرف Check-Out (تحديث المخزون وتوثيق الحركة)
router.post('/checkout', verifyToken, async (req, res) => {
  const { productId, quantity, jobSite, notes } = req.body;
  try {
    await pool.query('BEGIN'); // بدء المعاملة لضمان أمان البيانات
    
    // تقليل الكمية في المخزن بشرط أن تكون متوفرة (مع إعادة كافة بيانات المنتج عبر RETURNING *)
    const updatedProduct = await pool.query(
      'UPDATE products SET quantity = quantity - $1 WHERE id = $2 AND quantity >= $1 RETURNING *',
      [quantity, productId]
    );

    if (updatedProduct.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'الكمية المطلوبة غير متوفرة في المخزن!' });
    }

    const product = updatedProduct.rows[0];

    // طباعة فحص للتأكد في الـ Terminal
    console.log('--- فحص الحد الأدنى للمخزون ---');
    console.log('اسم المنتج:', product.name);
    console.log('الكمية الحالية:', product.quantity);
    console.log('الحد الأدنى المطلوب:', product.min_stock);

    // تسجيل العملية في جدول الحركات (inventory_logs)
    await pool.query(
      `INSERT INTO inventory_logs (product_id, user_id, type, quantity, job_site, notes)
        VALUES ($1, $2, 'CHECK_OUT', $3, $4, $5)`,
      [productId, req.user.id, quantity, jobSite, notes]
    );

    await pool.query('COMMIT');

    // 1. الرد الفوري على المتصفح والفرونت إند لضمان السرعة القصوى
    res.json({ message: 'تمت عملية الصرف بنجاح وتحديث المخزون' });

    // 2. التحقق وإرسال البريد في الخلفية (بدون await) لكي لا ينتظر المستخدم إرسال الإيميل
    if (product.quantity <= product.min_stock) {
      console.log('⚠️ الكمية وصلت للحد الأدنى، جاري إرسال البريد في الخلفية...');
      sendLowStockAlert(product.name, product.quantity, product.min_stock)
        .catch(err => console.error('خطأ في إرسال البريد:', err));
    }

  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});
// 5. جلب سجل الحركات (Inventory Logs) مع اسم المنتج واسم المستخدم
router.get('/logs', verifyToken, async (req, res) => {
  try {
    const logs = await pool.query(`
      SELECT inventory_logs.*, products.name AS product_name, users.name AS user_name 
      FROM inventory_logs 
      JOIN products ON inventory_logs.product_id = products.id 
      JOIN users ON inventory_logs.user_id = users.id 
      ORDER BY inventory_logs.created_at DESC
    `);
    res.json(logs.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 4. عملية الإرجاع Check-In
router.post('/checkin', verifyToken, async (req, res) => {
  const { productId, quantity, jobSite, notes } = req.body;
  try {
    await pool.query('BEGIN');

    // زيادة الكمية في المخزن
    const updatedProduct = await pool.query(
      'UPDATE products SET quantity = quantity + $1 WHERE id = $2 RETURNING *',
      [quantity, productId]
    );

    // تسجيل عملية الإرجاع في السجل
    await pool.query(
      `INSERT INTO inventory_logs (product_id, user_id, type, quantity, job_site, notes)
       VALUES ($1, $2, 'CHECK_IN', $3, $4, $5)`,
      [productId, req.user.id, quantity, jobSite, notes]
    );

    await pool.query('COMMIT');
    res.json({ message: 'تمت عملية الإرجاع بنجاح وتحديث المخزون' });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});
// تعديل منتج بناءً على الـ id أو الـ sku
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, price, job_site, min_stock_level } = req.body;
    
    // التأكد من أننا نقارن الحقل الصحيح بدون تسبب بأخطاء نوع البيانات (Type Casting)
    const updated = await pool.query(
      `UPDATE products 
       SET name = $1, category = $2, quantity = $3, price = $4, job_site = $5, min_stock_level = $6 
       WHERE id::text = $7 OR sku = $7 RETURNING *`,
      [name, category, quantity, price, job_site, min_stock_level, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. (اختياري إذا كان هناك ربط مع جدول السجلات) حذف السجلات المرتبطة أولاً لمنع تعارض المفتاح الأجنبي
    // await pool.query('DELETE FROM logs WHERE product_id::text = $1', [id]);

    // 2. حذف المنتج مع ضمان مطابقة نوع البيانات (تحويل الـ id إلى نص للمقارنة السليمة)
    const deleted = await pool.query(
      'DELETE FROM products WHERE id::text = $1 OR sku = $1 RETURNING *', 
      [id]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    res.json({ message: 'تم حذف المنتج بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;