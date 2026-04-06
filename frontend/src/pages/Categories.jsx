import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Edit, Trash2, Plus, ArrowRight } from 'lucide-react';

const Categories = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/api/categories');
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const { data } = await axios.post('/api/categories', { name: newCategoryName });
      // Since the API returns the new category without articleCount, we can add it locally
      setCategories([...categories, { ...data, articleCount: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const updateCategory = async (id, e) => {
    e.stopPropagation();
    if (!editCategoryName.trim()) return;
    try {
      const { data } = await axios.put(`/api/categories/${id}`, { name: editCategoryName });
      setCategories(categories.map(c => c._id === id ? { ...c, name: data.name } : c).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingCategory(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update category');
    }
  };

  const deleteCategory = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/categories/${id}`);
        setCategories(categories.filter(c => c._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-up" style={{ padding: '4rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BookOpen size={40} color="var(--primary)" /> Categories
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Browse knowledge by topic</p>
        </div>
      </div>

      {isAdmin && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} color="var(--primary)" /> Add New Category
          </h2>
          <form onSubmit={createCategory} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Category Name" 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="glass-card"
              style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid var(--card-border)', background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderRadius: '8px' }}
            />
            <button type="submit" className="btn btn-primary">Add</button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {categories.map(category => (
          <div 
            key={category._id} 
            onClick={() => navigate(`/categories/${category._id}`)}
            className="glass-card" 
            style={{ 
              padding: '1.5rem 2rem', 
              transition: 'all 0.3s', 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div>
                 {editingCategory === category._id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }} onClick={e => e.stopPropagation()}>
                      <input 
                        type="text" 
                        value={editCategoryName}
                        onChange={e => setEditCategoryName(e.target.value)}
                        style={{ padding: '0.5rem', border: '1px solid var(--primary)', background: 'rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '4px', maxWidth: '150px' }}
                        autoFocus
                      />
                      <button onClick={(e) => updateCategory(category._id, e)} className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Save</button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingCategory(null); }} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Cancel</button>
                    </div>
                 ) : (
                   <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'white' }}>{category.name}</h3>
                 )}
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                   {category.articleCount || 0} article{category.articleCount !== 1 ? 's' : ''}
                 </p>
               </div>
               
               {isAdmin && !editingCategory && (
                 <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingCategory(category._id); 
                        setEditCategoryName(category.name); 
                      }} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '4px' }}
                      className="hover-bg-light"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={(e) => deleteCategory(category._id, e)} 
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '4px' }}
                      className="hover-bg-red"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
               )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>Explore</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 && !loading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <p>No categories found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
