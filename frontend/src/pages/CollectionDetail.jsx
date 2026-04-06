import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, ThumbsUp, Trash2, FolderMinus, Shield } from 'lucide-react';
import { useAuth } from '../AuthContext';
import FollowButton from '../components/FollowButton';

const CollectionDetail = () => {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const fetchCollection = async () => {
    try {
      const { data } = await api.get(`/api/collections/${id}`);
      setCollection(data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        navigate('/collections');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeArticle = async (e, articleId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/api/collections/${id}/remove`, { articleId });
      setCollection(prev => ({
        ...prev,
        articles: prev.articles.filter(a => a._id !== articleId)
      }));
    } catch (error) {
      console.error('Failed to remove article', error);
      alert('Failed to remove article');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}><div className="loader"></div></div>;
  if (!collection) return null;

  return (
    <div className="animate-up" style={{ padding: '4rem 0' }}>
      <Link to="/collections" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        <ArrowLeft size={18} /> Back to Collections
      </Link>

      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{collection.name}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {collection.articles.length} {(collection.articles.length === 1) ? 'Saved Article' : 'Saved Articles'}
        </p>
      </div>

      {collection.articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>This collection is empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Explore knowledge and save articles here for later reading.</p>
          <Link to="/articles" className="btn btn-primary">Explore Articles</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {collection.articles.map(article => (
            <div 
              key={article._id} 
              onClick={() => navigate(`/articles/${article._id}`)}
              className="glass-card" 
              style={{ padding: '2rem', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative' }}
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
                <button 
                  onClick={(e) => removeArticle(e, article._id)}
                  style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#f59e0b', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', transition: 'background 0.3s' }}
                  className="hover-bg-yellow"
                  title="Remove from Collection"
                >
                  <FolderMinus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionDetail;
