import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Shield, Users, BookOpen, ThumbsUp, Activity, UserPlus, FileText, Settings, Trash2, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalArticles: 0, totalLikes: 0 });
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes, catsRes] = await Promise.all([
          axios.get('/api/users/admin/stats'),
          axios.get('/api/users/admin/users'),
          axios.get('/api/categories')
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setCategories(catsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load admin data. Please ensure you have administrative privileges.');
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        setUsers(users.filter(u => u._id !== userId));
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const { data } = await axios.post('/api/categories', { name: newCategoryName });
      setCategories([...categories, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const updateCategory = async (id) => {
    if (!editCategoryName.trim()) return;
    try {
      const { data } = await axios.put(`/api/categories/${id}`, { name: editCategoryName });
      setCategories(categories.map(c => c._id === id ? data : c).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingCategory(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update category');
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/categories/${id}`);
        setCategories(categories.filter(c => c._id !== id));
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  if (error) return (
    <div style={{ padding: '4rem 0', textAlign: 'center' }}>
      <div className="glass-card" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto', border: '1px solid #ef4444' }}>
        <Shield size={48} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ marginBottom: '1rem' }}>Unauthorized Access</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{error}</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </div>
  );

  return (
    <div className="animate-up" style={{ padding: '4rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={36} color="var(--primary)" /> Admin Control Center
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Global system overview and management.</p>
        </div>
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '50px', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%' }}></div>
          ADMIN: {user?.name}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard 
          icon={<Users size={24} color="#6366f1" />} 
          label="Total Users" 
          value={stats.totalUsers} 
          color="rgba(99, 102, 241, 0.1)"
        />
        <StatCard 
          icon={<BookOpen size={24} color="#10b981" />} 
          label="Total Articles" 
          value={stats.totalArticles} 
          color="rgba(16, 185, 129, 0.1)"
        />
        <StatCard 
          icon={<ThumbsUp size={24} color="#ec4899" />} 
          label="Global Likes" 
          value={stats.totalLikes} 
          color="rgba(236, 72, 153, 0.1)"
        />
        <StatCard 
          icon={<Tag size={24} color="#f59e0b" />} 
          label="Categories" 
          value={categories.length} 
          color="rgba(245, 158, 11, 0.1)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} /> Registered Users
            </h2>
            <Link to="/signup" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
              <UserPlus size={14} /> Add User
            </Link>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--card-border)' }}>
                  <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{u.username}</div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        textTransform: 'uppercase',
                        background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : u.role === 'staff' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: u.role === 'admin' ? '#ef4444' : u.role === 'staff' ? '#6366f1' : 'var(--text-secondary)'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem' }}>{u.email}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <button onClick={() => deleteUser(u._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/articles" className="btn btn-primary" style={{ justifyContent: 'center', gap: '0.5rem' }}>
              <FileText size={18} /> Manage All Articles
            </Link>
            <Link to="/create-article" className="btn btn-outline" style={{ justifyContent: 'center', gap: '0.5rem' }}>
              <Activity size={18} /> Create Admin Announcement
            </Link>
            <button className="btn btn-outline" style={{ justifyContent: 'center', gap: '0.5rem' }} disabled>
              <Settings size={18} /> System Settings
            </button>
          </div>
          
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', marginTop: '3rem' }}>Categories</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="New category..." 
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              className="glass-card"
              style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--card-border)', background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderRadius: '8px' }}
            />
            <button onClick={createCategory} className="btn btn-primary" style={{ padding: '0.75rem 1rem' }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {categories.map(c => (
              <div key={c._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                {editingCategory === c._id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '1rem' }}>
                    <input 
                      type="text" 
                      value={editCategoryName}
                      onChange={e => setEditCategoryName(e.target.value)}
                      style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--primary)', background: 'rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '4px' }}
                      autoFocus
                    />
                    <button onClick={() => updateCategory(c._id)} className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Save</button>
                    <button onClick={() => setEditingCategory(null)} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setEditingCategory(c._id); setEditCategoryName(c.name); }} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.3rem' }}>
                        Edit
                      </button>
                      <button onClick={() => deleteCategory(c._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem' }}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ef4444' }}>Admin Security Tip:</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>You are in elevated privilege mode. All actions are logged and reflected across the global repository.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
    <div style={{ background: color, padding: '1rem', borderRadius: '15px' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{value}</div>
    </div>
  </div>
);

export default AdminDashboard;
