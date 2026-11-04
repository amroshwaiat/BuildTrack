import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
export default function Employees() {
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchUsers();
  }, []);
  const { user, logout } = useContext(AuthContext);
  const token = localStorage.getItem('token');
    const userImage = user?.profile_image || user?.profileImage;
    const navigate = useNavigate();
// جلب المستخدمين
  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://buildtrack-s2us.onrender.com/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users');
    }
  };
  // حذف المستخدم
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`https://buildtrack-s2us.onrender.com/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    alert('User deleted successfully!');
      fetchUsers(); // تحديث القائمة
    } catch (err) {
  alert('An error occurred during deletion');
    }
  };

  // تعديل الصلاحية أو كلمة السر
  const handleEditUser = async (id) => {
   const newRole = prompt('Enter new role (admin or staff):');
    if (!newRole) return;
    const newPassword = prompt('Enter new password (leave blank if unchanged):');

    try {
      await axios.put(`https://buildtrack-s2us.onrender.com/api/auth/users/${id}`, {
        role: newRole,
        password: newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  alert('Updated successfully!');
      fetchUsers(); // تحديث القائمة
    } catch (err) {
    alert('An error occurred during update');
    }
  };
useEffect(() => {
  if (token) {
    fetchUsers();
  }
}, [token]);

  // إضافة موظف جديد
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
     const res = await axios.post('https://buildtrack-s2us.onrender.com/api/auth/users', form, {
  headers: { Authorization: `Bearer ${token}` }
});
      alert(res.data.message || 'User added successfully!');
      setForm({ name: '', email: '', password: '', role: 'staff' });
      fetchUsers();
    }  catch (err) {
  alert(err.response?.data?.error || err.message);
}
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', direction: 'ltr', background: '#f1f5f9',flexWrap:'wrap' }}>
      
      {/* القائمة الجانبية (Sidebar) */}
      <div style={{ width: '240px', background: '#0f172a', color: '#fff', padding: '20px' }}>
         <h2>            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px'  }}>
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

      {/* المحتوى الرئيسي */}
      <div style={{ flex: 1, padding: '30px' }}>
        <h1>👥 User & Access Management</h1>

        {/* نموذج إضافة موظف */}
        <form onSubmit={handleAddUser} style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
          <h3>Add New User Account</h3>
          <div style={{ marginBottom: '15px', marginTop: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name:</label>
            <input 
              type="text" 
              placeholder="e.g., John Doe..." 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
            <input 
              type="email" 
              placeholder="user@buildtrack.com" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
            <input 
              type="password" 
              placeholder="******" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Role:</label>
            <select 
              value={form.role} 
              onChange={e => setForm({...form, role: e.target.value})} 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
         Save & Add User
          </button>
        </form>

        {/* جدول المستخدمين */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', marginTop: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3>Registered Accounts List</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', marginTop: '15px' }}>
  <thead>
    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
      <th style={{ padding: '10px' }}>Name</th>
      <th style={{ padding: '10px' }}>Email </th>
      <th style={{ padding: '10px' }}>Role</th>
      <th style={{ padding: '10px' }}>Joining Date</th>
      <th style={{ padding: '10px' }}>Actions</th> {/* ← عمود جديد */}
    </tr>
  </thead>
  <tbody>
    {users.map((u) => (
      <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
        <td style={{ padding: '10px', fontWeight: 'bold' }}>{u.name}</td>
        <td style={{ padding: '10px' }}>{u.email}</td>
        <td style={{ padding: '10px' }}>
          <span style={{
            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
            background: u.role === 'admin' ? '#fee2e2' : '#e0f2fe',
            color: u.role === 'admin' ? '#991b1b' : '#0369a1'
          }}>
            {u.role === 'admin' ? 'Admin' : 'Staff'}
          </span>
        </td>
        <td style={{ padding: '10px', fontSize: '13px', color: '#64748b' }}>
         {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}
        </td>
        <td style={{ padding: '10px' }}>
          <button 
            onClick={() => handleEditUser(u.id)}
            style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' }}>
            Edit
          </button>
          <button 
            onClick={() => handleDeleteUser(u.id)}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
        </div>

      </div>
    </div>
  );
}