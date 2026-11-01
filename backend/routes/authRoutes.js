const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { login, updateProfile, adminUpdateUser, deleteUser } = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// مسار تسجيل الدخول
router.post('/login', login);

// 1. جلب قائمة جميع المستخدمين (محمي بـ verifyToken)
router.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC');
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// تعديل مستخدم بواسطة الآدمن
router.put('/users/:id', verifyToken, adminUpdateUser);

// حذف مستخدم بواسطة الآدمن
router.delete('/users/:id', verifyToken, deleteUser);
router.put('/profile', verifyToken, updateProfile);
// 2. إضافة موظف جديد بواسطة الأدمن (بدون تشفير مؤقتاً لتتوافق مع الـ Login)
router.post('/users', verifyToken, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // تشفير كلمة المرور أولاً لكي تعمل مع الـ Login
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'staff']
    );
    res.status(201).json({ message: 'تم إضافة الموظف بنجاح', user: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;