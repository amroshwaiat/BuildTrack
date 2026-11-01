import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
export default function Profile() {
  const { user, setUser, logout } = useContext(AuthContext);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
const userImage = user?.profile_image || user?.profileImage;
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    profileImage: user?.profileImage || ''
  });

  const [preview, setPreview] = useState(user?.profile_image || user?.profileImage || '');
  // المعالجة عند اختيار صورة جديدة
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData({ ...formData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // حفظ التعديلات
  // حفظ التعديلات
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 🔴 هنا قمنا بتعريف res لحفظ الرد القادم من السيرفر
      const res = await axios.put(
        'http://localhost:5000/api/auth/profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // تحديث بيانات المستخدم في الـ Context والـ localStorage فوراً
    if (res.data && res.data.user) {
  // التأكد من توحيد اسم المفتاح (إذا كان القادم من القاعدة profile_image نخزنه أو نتعامل معه بسلاسة)
  const updatedUser = {
    ...res.data.user,
    profileImage: res.data.user.profile_image || res.data.user.profileImage
  };
  
  setUser(updatedUser);
  localStorage.setItem('user', JSON.stringify(updatedUser));
}

     alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
     alert(err.response?.data?.message || 'An error occurred during update');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', direction: 'ltr', background: '#f1f5f9' }}>
      
      {/* القائمة الجانبية */}
      <div style={{ width: '240px', background: '#0f172a', color: '#fff', padding: '20px',flexWrap:'wrap' }}>
         <h2>            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: 10 }}>
   BuildTrack
  </p> 
  {/* دائرة الصورة الشخصية */}
  <div style={{
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #38bdf8',
    marginBottom: '10px'
  }}>
    {userImage ? (
      <img 
        src={userImage} 
        alt="Profile" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />
    ) : (
      // أيقونة افتراضية في حال لم تكن هناك صورة مرفوعة
      <span style={{ color: '#fff', fontSize: '24px' }}>👤</span>
    )}
  </div>
  
<p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
    Hello, {user?.name || 'مستخدم'} ({user?.role})
  </p>
</div></h2>
     
       <hr style={{ borderColor: '#334155', margin: '20px 0' }} />
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5' }}>
          <li>
            <NavLink to="/" end style={({ isActive }) => ({ color: isActive ? '#3b82f6' : '#fff', textDecoration: 'none', fontWeight: isActive ? 'bold' : 'normal' })}>
            📦 Inventory
            </NavLink>
          </li>
          <li>
            <NavLink to="/checkout" end style={({ isActive }) => ({ color: isActive ? '#3b82f6' : '#fff', textDecoration: 'none', fontWeight: isActive ? 'bold' : 'normal' })}>
              📤 Check Out
            </NavLink>
          </li>
          <li>
            <NavLink to="/checkin" end style={({ isActive }) => ({ color: isActive ? '#3b82f6' : '#fff', textDecoration: 'none', fontWeight: isActive ? 'bold' : 'normal' })}>
            📥 Check In
            </NavLink>
          </li>
          {user && user.role === 'admin' && (
            <li>
              <NavLink to="/logs" end style={({ isActive }) => ({ color: isActive ? '#3b82f6' : '#fff', textDecoration: 'none', fontWeight: isActive ? 'bold' : 'normal' })}>
               📋 Logs
              </NavLink>
            </li>
          )}
          {user && user.role === 'admin' && (
            <li>
              <NavLink to="/employees" end style={({ isActive }) => ({ color: isActive ? '#3b82f6' : '#fff', textDecoration: 'none', fontWeight: isActive ? 'bold' : 'normal' })}>
               👥 Employees
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/profile" end style={({ isActive }) => ({ color: isActive ? '#3b82f6' : '#fff', textDecoration: 'none', fontWeight: isActive ? 'bold' : 'normal' })}>
            👤 Profile
            </NavLink>
          </li>
        </ul>

    <button 
  onClick={() => {
    logout();          // مسح البيانات وتسجيل الخروج
    navigate('/login'); // الانتقال الفوري لصفحة تسجيل الدخول
  }} 
  style={{ marginTop: '40px', background: '#ef4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
>
Logout
</button>
{/* حقوق النشر */}
<div style={{ marginTop: '30px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
  © 2026 BuildTrack. All rights reserved.
</div>
      </div>

      {/* نموذج تعديل الملف الشخصي */}
      <div style={{ flex: 1, padding: '40px' }}>
        <h1>👤 Profile Settings</h1>

        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '30px', borderRadius: '8px', maxWidth: '500px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          
          {/* المعاينة والصورة */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#e2e8f0', margin: '0 auto 10px auto', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {preview ? (
                <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '32px', color: '#64748b' }}>👤</span>
              )}
            </div>
            <label style={{ cursor: 'pointer', color: '#0284c7', fontSize: '14px', fontWeight: 'bold' }}>
             Change Profile Picture
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email :</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>New Password (leave blank if unchanged):</label>
            <input
              type="password"
              placeholder="******"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <button type="submit" style={{ width: '100%', background: '#0284c7', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Save Changes
          </button>
        </form>
      </div>

    </div>
  );
}