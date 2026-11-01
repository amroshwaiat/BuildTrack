
import { Html5QrcodeScanner } from 'html5-qrcode';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
export default function Inventory() {
  const [products, setProducts] = useState([]);
 const [form, setForm] = useState({
  sku: '',
  name: '',
  category: '',
  quantity: '',
  price: '',
  job_site: ''
});
const [isEditing, setIsEditing] = useState(false);
const [editId, setEditId] = useState(null);
const [scannerOpen, setScannerOpen] = useState(false);
const navigate = useNavigate();
  useEffect(() => {
    if (scannerOpen) {
      const scanner = new Html5QrcodeScanner('reader-inventory', { fps: 10, qrbox: 250 });
      
      scanner.render(
        (decodedText) => {
          // عند قراءة الكود بنجاح، يتم وضعه مباشرة في خانة الـ SKU بالنموذج
          setForm(prev => ({ ...prev, sku: decodedText }));
          alert(`تم التقاط الـ SKU بنجاح: ${decodedText}`);
          scanner.clear();
          setScannerOpen(false);
        },
        (error) => {
          // الأخطاء المؤقتة أثناء البحث تتجاهل لضمان سلاسة المسح
        }
      );

      return () => {
        scanner.clear().catch(error => console.error("Failed to clear scanner. ", error));
      };
    }
  }, [scannerOpen]);
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProducts();
  }, []);
  const { user, logout } = useContext(AuthContext);
const userImage = user?.profile_image || user?.profileImage;
  const token = localStorage.getItem('token');

  // جلب المنتجات من الـ Backend
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error('خطأ في جلب المنتجات', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // إضافة منتج جديد (للأدمن فقط)
 const handleAddProduct = async (e) => {
  e.preventDefault();
  try {
    if (isEditing) {
      // طلب التعديل (PUT)
      await axios.put(`http://localhost:5000/api/products/${editId}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Product updated successfully!');
    } else {
      // طلب الإضافة الجديدة (POST)
      await axios.post('http://localhost:5000/api/products', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Product added successfully!');
    }

    // إعادة تعيين النموذج والحالات
    setForm({ sku: '', name: '', category: '', quantity: 0, min_stock_level: 5, price: 0, job_site: '' });
    setIsEditing(false);
    setEditId(null);
    fetchProducts();
  } catch (err) {
    alert(err.response?.data?.error || err.response?.data?.message || 'An error occurred while saving data');
  }
};
// دالة تحضير التعديل
const handleEdit = (product) => {
  setForm({
    sku: product.sku || '',
    name: product.name || '',
    category: product.category || '',
    quantity: product.quantity || 0,
    min_stock_level: product.min_stock_level || 5,
    price: product.price || 0,
    job_site: product.job_site || ''
  });
  setIsEditing(true);
  setEditId(product.sku); // استخدام الـ sku بدلاً من id إذا لم يكن لديك حقل id رقمي
};

// دالة حذف المنتج
const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this product?')) {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== id));
      alert('Product deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'An error occurred during deletion');
    }
  }
};
const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // تصفية المنتجات بناءً على البحث (بالاسم أو الـ SKU) والتصنيف
  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) : [];
  return (
   <div style={{ display: 'flex', minHeight: '100vh', direction: 'ltr', background: '#f1f5f9' }}>
      
      {/* القائمة الجانبية (Sidebar) */}
      <div style={{ width: '240px', background: '#0f172a', color: '#fff', padding: '20px'  ,flexWrap:'wrap'}}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Inventory Management</h1>
        </div>
        {/* خانة البحث والفلترة */}
<div style={{ marginBottom: '20px', display: 'gap', gap: '10px' }}>
  <input
    type="text"
  placeholder="Search by product name or SKU..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{ padding: '8px 12px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
  />
</div>

        {/* نموذج إضافة منتج يظهر للأدمن فقط */}
        {user?.role === 'admin' && (
          <form onSubmit={handleAddProduct} style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3>{isEditing ? 'Edit Product' : 'Add New Item to Inventory'}</h3>
            {/* زر فتح الكاميرا لمسح الـ QR وتعبئة الـ SKU */}
<div style={{ marginBottom: '10px', gridColumn: 'span 4' }}>
  <button 
  type="button"
  onClick={() => setScannerOpen(!scannerOpen)}
  style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
>
  {scannerOpen ? '❌ Close Camera' : '📸 Scan QR Code to Fill SKU'}
</button>
</div>

{scannerOpen && (
  <div id="reader-inventory" style={{ marginBottom: '15px', background: '#fff', padding: '10px', borderRadius: '8px', gridColumn: 'span 4', maxWidth: '400px' }}></div>
)}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '15px' }}>
              <input placeholder="SKU" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required style={{ padding: '8px' }} />
              <input placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={{ padding: '8px' }} />
              <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required style={{ padding: '8px' }} />
             <input 
  type="number" 
  placeholder="Quantity"
  value={form.quantity} 
  onChange={e => setForm({...form, quantity: e.target.value})} 
  autoComplete="off"
  required 
  style={{ padding: '8px', textAlign: 'left' }} 
/>

<input 
  type="number" 
  placeholder="Price ($)"
  value={form.price} 
  onChange={e => setForm({...form, price: e.target.value})} 
  autoComplete="off"
  required 
  style={{ padding: '8px', textAlign: 'left' }} 
/>
              <input placeholder="Job Site / Location" value={form.job_site} onChange={e => setForm({...form, job_site: e.target.value})} style={{ padding: '8px' }} />
            </div>
            <button type="submit" style={{ marginTop: '15px', background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {isEditing ? 'Update Product' : 'Save Product'}
            </button>
          </form>
        )}

        {/* جدول عرض المنتجات */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
         <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
  <thead>
    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
      <th style={{ padding: '14px 16px' }}>SKU</th>
      <th style={{ padding: '14px 16px' }}>Product Name</th>
      <th style={{ padding: '14px 16px' }}>Category</th>
      <th style={{ padding: '14px 16px' }}>Quantity</th>
      <th style={{ padding: '14px 16px' }}>Price</th>
      <th style={{ padding: '14px 16px' }}>Job Site</th>
      {user && user.role === 'admin' && (
        <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
      )}
    </tr>
  </thead>
  <tbody>
    {filteredProducts.length > 0 ? (
      filteredProducts.map((product) => (
        <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
          <td style={{ padding: '14px 16px', color: '#64748b' }}>{product.sku}</td>
          <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#1e293b' }}>{product.name}</td>
          <td style={{ padding: '14px 16px', color: '#475569' }}>{product.category || '-'}</td>
          <td style={{ padding: '14px 16px' }}>
            {product.quantity <= 5 ? ( 
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{product.quantity}</span>
                <span style={{ 
                  background: '#fee2e2', 
                  color: '#991b1b', 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  fontSize: '11px', 
                  fontWeight: 'bold' 
                }}>
                  low ⚠️
                </span>
              </span>
            ) : (
              product.quantity
            )}
          </td>
          <td style={{ padding: '14px 16px', color: '#059669', fontWeight: 'bold' }}>${product.price}</td>
          <td style={{ padding: '14px 16px', color: '#475569' }}>{product.job_site || '-'}</td>
          
          {user && user.role === 'admin' && (
            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button 
                  type="button"
                  onClick={() => handleEdit(product)}
                  style={{ padding: '6px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                >
                  Edit
                </button>
                
                <button 
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  style={{ padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                >
                  Delete
                </button>
              </div>
            </td>
          )}
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No products found</td>
      </tr>
    )}
  </tbody>
</table>
       
        </div>

      </div>
    </div>
  );
}