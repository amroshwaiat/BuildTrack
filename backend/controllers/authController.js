const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, password, profileImage } = req.body;

  try {
    let updateQuery = 'UPDATE users SET name = $1, email = $2';
    let params = [name, email];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `, password = $${params.length + 1}`;
      params.push(hashedPassword);
    }

    // حفظ الصورة بصيغة Base64 في عمود profile_image
    if (profileImage) {
      updateQuery += `, profile_image = $${params.length + 1}`;
      params.push(profileImage);
    }

    // إرجاع البيانات المحدثة بما فيها الصورة لتحديث الـ Context فوراً
   // تأكد من إضافة profile_image في نهاية جملة الـ RETURNING
updateQuery += ` WHERE id = $${params.length + 1} RETURNING id, name, email, role, profile_image`;
    params.push(userId);

    const result = await pool.query(updateQuery, params);
    res.json({ message: 'تم التحديث بنجاح', user: result.rows[0] });

  } catch (err) {
    console.error("خطأ في تحديث الملف الشخصي:", err);
    res.status(500).json({ message: 'خطأ في السيرفر أثناء التحديث' });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // 👈 هنا الخطأ السابق: يجب تعريف المتغير user لكي يتم قراءة كلمة المرور المشفرة منه
    const user = userResult.rows[0];

    // مقارنة كلمة السر المدخلة مع كلمة السر المشفرة في قاعدة البيانات
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'SECRET_KEY_123',
      { expiresIn: '1d' }
    );

    res.json({ message: 'تم تسجيل الدخول بنجاح', token, user });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
// تعديل بيانات المستخدم بواسطة الآدمن (الصلاحية أو كلمة السر)
const adminUpdateUser = async (req, res) => {
  const { id } = req.params;
  const { role, password } = req.body;

  try {
    let updateQuery = 'UPDATE users SET role = $1';
    let params = [role, id];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = 'UPDATE users SET role = $1, password = $2 WHERE id = $3 RETURNING id, name, email, role';
      params = [role, hashedPassword, id];
    } else {
      updateQuery += ' WHERE id = $2 RETURNING id, name, email, role';
    }

    const result = await pool.query(updateQuery, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.json({ message: 'تم تحديث بيانات المستخدم بنجاح', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// حذف مستخدم بواسطة الآدمن
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
module.exports = { login, updateProfile ,deleteUser,adminUpdateUser};