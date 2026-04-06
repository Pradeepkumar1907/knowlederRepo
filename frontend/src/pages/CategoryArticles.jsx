import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, BookOpen, ThumbsUp, Trash2, Shield, Bookmark } from 'lucide-react';
import { useAuth } from '../AuthContext';
import FollowButton from '../components/FollowButton';
import SaveToCollectionModal from '../components/SaveToCollectionModal';

const CategoryArticles = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState([]);
  const [categoryName, setCategoryName] = useState('Category');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedArticleId, setSavedArticleId] = useState(null);

  const fetchCategoryAndArticles = async () => {
    setLoading(true);
    try {
      // Fetch all categories to get the name of this specific one
      const catRes = await api.get('/api/categories');
      const category = catRes.data.find(c => c._id === id || c.id === id);
      if (category) {
        setCategoryName(category.name);
      }

      // Fetch articles for this category
      const res = await api.get(`/api/articles?category=${id}`);
      setArticles(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryAndArticles();
  }, [id]);

  const deleteArticle = async (e, articleId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await api.delete(`/api/articles/${articleId}`);
        fetchCategoryAndArticles();
      } catch (error) {
        console.error(error);
        alert('Failed to delete article');
      }
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div className="animate-up" style={{ padding: '4rem 0' }}>
      <Link to="/categories" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem' }} className="hover-text-primary">
        <ArrowLeft size={16} /> Back to Categories
      </Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BookOpen size={40} color="var(--primary)" /> {categoryName} Articles
        </h1>
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '50px', fontWeight: 600, fontSize: '0.9rem' }}>
          {articles.length} Article{articles.length !== 1 ? 's' : ''}
        </div>
      </div>

      {articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No articles in this category</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Check back later for updates.</p>
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
                  {categoryName}
                </div>
                {user?.role === 'admin' && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Shield size={12} /> MOD
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <ThumbsUp size={14} /> {article.likes?.length || 0}
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

export default CategoryArticles;
