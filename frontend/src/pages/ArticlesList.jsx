import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Search, Filter, ArrowRight, Book, ThumbsUp, Trash2, Shield, Bookmark } from 'lucide-react';
import FollowButton from '../components/FollowButton';
import Dropdown from '../components/Dropdown';
import SaveToCollectionModal from '../components/SaveToCollectionModal';

const ArticlesList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryName, setCategoryName] = useState('All');
  const [categoryId, setCategoryId] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedArticleId, setSavedArticleId] = useState(null);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/api/categories');
      setAvailableCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const queryCat = categoryId || (categoryName === 'All' ? 'All' : '');
      const { data } = await axios.get(`/api/articles?search=${search}&category=${queryCat}`);
      setArticles(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const deleteArticle = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await axios.delete(`/api/articles/${id}`);
        fetchArticles();
      } catch (error) {
        console.error(error);
        alert('Failed to delete article');
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchArticles();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, categoryId, categoryName]);

  return (
    <div className="animate-up" style={{ padding: '4rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem' }}>Explore Knowledge</h1>
        
        <div style={{ display: 'flex', gap: '1rem', width: '60%', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-card"
              style={{ width: '100%', padding: '1rem 3rem 1rem 1.5rem', border: '1px solid var(--card-border)', background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderRadius: '12px' }}
            />
            <Search style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
          </div>

          <div style={{ width: '200px' }}>
            <Dropdown 
              options={['All', ...availableCategories.map(c => c.name)]} 
              selected={categoryName} 
              onSelect={(val) => {
                setCategoryName(val);
                if (val === 'All') {
                  setCategoryId('');
                } else {
                  const cat = availableCategories.find(c => c.name === val);
                  if (cat) setCategoryId(cat._id);
                }
              }} 
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No articles found</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {articles.map(article => (
            <div 
              key={article._id} 
              onClick={() => navigate(`/articles/${article._id}`)}
              className="glass-card" 
              style={{ padding: '2rem', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  {typeof article.category === 'object' && article.category !== null ? article.category.name : article.category}
                </div>
                {user?.role === 'admin' && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Shield size={12} /> MOD
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <ThumbsUp size={14} /> {article.likes.length}
                </div>
              </div>
              
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{article.title}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                {article.content}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.25rem' }}>
                <Link 
                  to={`/profile/${article.author?._id}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', color: 'white' }}
                >
                  {article.author?.name?.charAt(0)}
                </Link>
                <div style={{ flex: 1 }}>
                  <Link 
                    to={`/profile/${article.author?._id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontWeight: 600, textDecoration: 'none', color: 'inherit' }}
                  >
                    {article.author?.name}
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(article.createdAt).toLocaleDateString()}</div>
                </div>
                <FollowButton targetUserId={article.author?._id} />
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) navigate('/login');
                      else {
                        setSavedArticleId(article._id);
                        setIsModalOpen(true);
                      }
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', transition: 'background 0.3s' }}
                    className="hover-bg-light"
                    title="Save to Collection"
                  >
                    <Bookmark size={18} />
                  </button>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteArticle(e, article._id);
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', transition: 'background 0.3s' }}
                      className="hover-bg-red"
                      title="Delete Article"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <SaveToCollectionModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSavedArticleId(null); }} 
        articleId={savedArticleId} 
      />
    </div>
  );
};

export default ArticlesList;
