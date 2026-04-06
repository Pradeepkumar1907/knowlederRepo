import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { Save, X, ArrowLeft, Type, AlignLeft, Tag } from 'lucide-react';
import Dropdown from '../components/Dropdown';

const CreateEditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/api/categories');
        setAvailableCategories(data);
        if (data.length > 0 && !id) {
          setCategoryName(data[0].name);
          setCategoryId(data[0]._id);
        }
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();

    if (id) {
      const fetchArticle = async () => {
        setFetching(true);
        try {
          const { data } = await api.get(`/api/articles/${id}`);
          if (data.author?._id !== user?._id && user?.role !== 'admin') {
            navigate('/articles');
            return;
          }
          setTitle(data.title);
          setContent(data.content);
          if (data.category) {
            setCategoryName(data.category.name);
            setCategoryId(data.category._id);
          }
          setFetching(false);
        } catch (error) {
          console.error(error);
          setFetching(false);
        }
      };
      fetchArticle();
    }
  }, [id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const articleData = { title, content, category: categoryId };

    try {
      if (id) {
        await api.put(`/api/articles/${id}`, articleData);
      } else {
        await api.post('/api/articles', articleData);
      }
      navigate('/articles');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (fetching) return <div>Loading...</div>;

  return (
    <div className="animate-up" style={{ padding: '4rem 0', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', background: 'none', marginBottom: '2rem' }}>
        <ArrowLeft size={18} /> Cancel & go back
      </button>

      <div className="glass-card" style={{ padding: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2.5rem' }}>{id ? 'Refine Knowledge' : 'Share New Knowledge'}</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Type size={16} /> Article Title
            </label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter a descriptive title..."
              required 
              style={{ fontSize: '1.25rem', padding: '1.25rem' }}
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={16} /> Category
            </label>
            <Dropdown 
              options={availableCategories.map(c => c.name)} 
              selected={categoryName} 
              onSelect={(val) => {
                setCategoryName(val);
                const found = availableCategories.find(c => c.name === val);
                if (found) setCategoryId(found._id);
              }} 
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlignLeft size={16} /> Content
            </label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Write your article content here..."
              required 
              style={{ 
                width: '100%', 
                minHeight: '400px', 
                padding: '1.25rem', 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid var(--card-border)', 
                borderRadius: 'var(--radius)', 
                color: 'white', 
                fontSize: '1.1rem',
                lineHeight: '1.6',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '1.25rem' }}>
              {loading ? 'Saving...' : (id ? 'Update Article' : 'Publish Article')}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '1.25rem' }}>
              <X size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditArticle;
