import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
export default function Logs() {
  const [logs, setLogs] = useState([]);
  const { user, logout } = useContext(AuthContext);
  const token = localStorage.getItem('token');
  const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const navigate = useNavigate();
const userImage = user?.profile_image || user?.profileImage;
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products/logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data);
      } catch (err) {
       console.error('Error fetching logs', err);
      }
    };
    fetchLogs();
  }, [token]);

  return (
   <div style={{ display: 'flex', minHeight: '100vh', direction: 'ltr', background: '#f1f5f9' }}>
      
      {/* القائمة الجانبية (Sidebar) */}
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
     {/* المحتوى الرئيسي */}
      <div style={{ flex: 1, padding: '30px' }}>
        <h1>📋 Audit Trail & Logs</h1>
        
        {/* حقول الفلترة حسب التاريخ */}
        <div style={{ margin: '20px 0', display: 'flex', gap: '15px', alignItems: 'center', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
         {/* حقل تاريخ البداية */}
<label style={{ fontWeight: 'bold' }}>From Date</label>
<input
  type="text"
  placeholder="YYYY-MM-DD"
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
  onFocus={(e) => (e.target.type = 'date')}
  onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', direction: 'ltr', textAlign: 'left' }}
/>

{/* حقل تاريخ النهاية */}
<label style={{ fontWeight: 'bold' }}>To Date</label>
<input
  type="text"
  placeholder="YYYY-MM-DD"
  value={endDate}
  onChange={(e) => setEndDate(e.target.value)}
  onFocus={(e) => (e.target.type = 'date')}
  onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', direction: 'ltr', textAlign: 'left' }}
/>
          
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              style={{ padding: '8px 15px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
             Clear Filter
            </button>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px' }}>Action Type</th>
                <th style={{ padding: '10px' }}>Product Name</th>
                <th style={{ padding: '10px' }}>Quantity</th>
                <th style={{ padding: '10px' }}>User</th>
                <th style={{ padding: '10px' }}>Job Site</th>
                <th style={{ padding: '10px' }}>Notes</th>
                <th style={{ padding: '10px' }}>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // تصفية السجلات بناءً على التاريخ
                const filteredLogs = logs.filter(log => {
                  if (!log.created_at) return true;
                  const logDate = new Date(log.created_at).toISOString().split('T')[0];
                  
                  if (startDate && logDate < startDate) return false;
                  if (endDate && logDate > endDate) return false;
                  return true;
                });

                if (filteredLogs.length === 0) {
                  return (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                       No audit logs found in this date range
                      </td>
                    </tr>
                  );
                }

                return filteredLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        background: log.type === 'CHECK_OUT' ? '#fee2e2' : '#d1fae5',
                        color: log.type === 'CHECK_OUT' ? '#991b1b' : '#065f46'
                      }}>
                        {log.type === 'CHECK_OUT' ? '📤 CHECK_OUT' : '📥 CHECK_IN'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{log.product_name}</td>
                    <td style={{ padding: '10px' }}>{log.quantity}</td>
                    <td style={{ padding: '10px' }}>{log.user_name}</td>
                    <td style={{ padding: '10px' }}>{log.job_site || '-'}</td>
                    <td style={{ padding: '10px' }}>{log.notes || '-'}</td>
                    <td style={{ padding: '10px', fontSize: '13px', color: '#64748b' }}>
                      <span dir="ltr" style={{ unicodeBidi: 'embed' }}>
  {new Date(log.created_at).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })}
</span>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}