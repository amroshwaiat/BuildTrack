import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode'; // 👈 استيراد مكتبة الماسح الضوئي
export default function CheckIn() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    productId: '',
    quantity: 1,
    jobSite: '',
    notes: ''
  });
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    if (scannerOpen) {
      const scanner = new Html5QrcodeScanner('reader-checkin', { fps: 10, qrbox: 250 });
      
      scanner.render(
        (decodedText) => {
          // البحث عن المنتج المطابق للـ SKU المستخرج من الـ QR
          const matchedProduct = products.find(p => p.sku === decodedText);
          if (matchedProduct) {
            setForm(prev => ({ ...prev, productId: matchedProduct.id }));
           alert(`Product recognized: ${matchedProduct.name}`);
          } else {
           alert(`Product with SKU (${decodedText}) not found in inventory!`);
          }
          
          scanner.clear();
          setScannerOpen(false);
        },
        (error) => {
          // الأخطاء المؤقتة أثناء المسح يتم تجاهلها لضمان الاستمرارية
        }
      );

      return () => {
        scanner.clear().catch(error => console.error("Failed to clear scanner. ", error));
      };
    }
  }, [scannerOpen, products]);
  const { user, logout } = useContext(AuthContext);
  const token = localStorage.getItem('token');
const userImage = user?.profile_image || user?.profileImage;
const navigate = useNavigate();
  // جلب المنتجات المتاحة
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products', err);
      }
    };
    fetchProducts();
  }, [token]);

  // تنفيذ عملية الإرجاع
  const handleCheckIn = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/products/checkin', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
    alert(res.data.message || 'Check-in completed and inventory updated successfully!');
      setForm({ productId: '', quantity: 1, jobSite: '', notes: '' });
    } catch (err) {
    alert(err.response?.data?.message || 'An error occurred during check-in');
    }
  };

  return (
   <div style={{ display: 'flex', minHeight: '100vh', direction: 'ltr', background: '#f1f5f9' }}>
      
      {/* القائمة الجانبية (Sidebar) */}
      <div style={{ width: '240px', background: '#0f172a', color: '#fff', padding: '20px' ,flexWrap:'wrap'}}>
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
        <h1>📥Check In Items</h1>

        <form onSubmit={handleCheckIn} style={{ background: '#fff', padding: '25px', borderRadius: '8px', maxWidth: '600px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          {/* زر فتح كاميرا مسح الـ QR للإرجاع */}
<div style={{ marginBottom: '15px' }}>
  <button 
    type="button"
    onClick={() => setScannerOpen(!scannerOpen)}
    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
  >
  {scannerOpen ? '❌ Close Camera' : '📸 Scan QR Code to Check In'}
  </button>
</div>

{/* حاوية ظهور الكاميرا */}
{scannerOpen && (
  <div id="reader-checkin" style={{ marginBottom: '20px', background: '#fff', padding: '10px', borderRadius: '8px', maxWidth: '500px' }}></div>
)}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Product to Check In:</label>
            <select 
              value={form.productId} 
              onChange={e => setForm({...form, productId: e.target.value})} 
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="">-- Select Item from Inventory --</option>
              {products.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} (Available: {item.quantity}) - SKU: {item.sku}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Quantity to Check In:</label>
            <input 
              type="number" 
              min="1" 
              value={form.quantity} 
              onChange={e => setForm({...form, quantity: e.target.value})} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Job Site:</label>
            <input 
              type="text" 
              placeholder="e.g., Ajloun Project" 
              value={form.jobSite} 
              onChange={e => setForm({...form, jobSite: e.target.value})} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Additional Notes:</label>
            <textarea 
              placeholder="Condition of returned items..." 
              value={form.notes} 
              onChange={e => setForm({...form, notes: e.target.value})} 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', height: '80px' }}
            />
          </div>

          <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
           Confirm Check In
          </button>

        </form>
      </div>
    </div>
  );
}