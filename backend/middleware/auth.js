const jwt = require('jsonwebtoken');

// دالة التحقق من التوكن (تسجيل الدخول)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'غير مسرح بالوصول، يرجى تسجيل الدخول' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY_123');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول' });
  }
};

// دالة التحقق من أن المستخدم أدمن
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'عذراً، هذه الصلاحية مخصصة للمدير (Admin) فقط' });
    }
  });
};

module.exports = { verifyToken, verifyAdmin };