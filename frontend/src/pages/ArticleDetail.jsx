import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { ThumbsUp, Calendar, User, ArrowLeft, Edit, Trash2, Bookmark } from 'lucide-react';
import FollowButton from '../components/FollowButton';
import SaveToCollectionModal from '../components/SaveToCollectionModal';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        const [{ data: articleData }, { data: commentsData }] = await Promise.all([
          api.get(`/api/articles/${id}`),
          api.get(`/api/articles/${id}/comments`)
        ]);
        setArticle(articleData);
        setComments(commentsData);
        setIsLiked(articleData.likes.includes(user?._id));
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchArticleData();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const { data } = await api.post(`/api/articles/${id}/like`);
      setArticle(prev => ({ 
        ...prev, 
        likes: data.isLiked ? [...prev.likes, user._id] : prev.likes.filter(lid => lid !== user._id) 
      }));
      setIsLiked(data.isLiked);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await api.delete(`/api/articles/${id}`);
        navigate('/articles');
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const { data } = await api.post(`/api/articles/${id}/comment`, { text: newComment });
      setComments(data);
      setNewComment('');
    } catch (error) {
      console.error(error);
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="loader"></div>
    </div>
  );

  if (!article) return <div style={{ textAlign: 'center', padding: '5rem' }}>Article not found</div>;

  const isOwner = user && (user._id === article.author?._id || user.role === 'admin');

  return (
    <div className="animate-up" style={{ padding: '4rem 0', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/articles" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        <ArrowLeft size={18} /> Back to Repository
      </Link>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
          {typeof article.category === 'object' && article.category !== null ? article.category.name : article.category}
        </span>
      </div>

      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '2rem', lineHeight: 1.2 }}>{article.title}</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2.5rem', borderBottom: '1px solid var(--card-border)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to={`/profile/${article.author?._id}`} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, textDecoration: 'none', color: 'white' }}>
            {article.author?.name?.charAt(0)}
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <Link to={`/profile/${article.author?._id}`} style={{ fontWeight: 600, fontSize: '1.1rem', textDecoration: 'none', color: 'inherit' }}>
                {article.author?.name}
              </Link>
              {user && article.author?._id !== user._id && (
                <FollowButton targetUserId={article.author?._id} />
              )}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', gap: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> {new Date(article.createdAt).toLocaleDateString()}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ThumbsUp size={14} /> {article.likes.length} Likes</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => { if (!user) navigate('/login'); else setIsModalOpen(true); }}
            className={`btn btn-outline`}
            style={{ borderRadius: '50px', padding: '0.5rem 1.5rem' }}
          >
            <Bookmark size={18} /> Save
          </button>
          
          <button 
            onClick={handleLike}
            className={`btn ${isLiked ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: '50px', padding: '0.5rem 1.5rem' }}
          >
            <ThumbsUp size={18} fill={isLiked ? 'white' : 'transparent'} /> {isLiked ? 'Liked' : 'Like'}
          </button>
          
          {isOwner && (
            <>
              <Link to={`/edit-article/${id}`} className="btn-outline btn" style={{ borderRadius: '50px', padding: '0.5rem' }}>
                <Edit size={18} />
              </Link>
              <button 
                onClick={handleDelete}
                className="btn-outline btn" 
                style={{ borderRadius: '50px', padding: '0.5rem', borderColor: '#ef4444', color: '#ef4444' }}
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ fontSize: '1.2rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#e2e8f0', marginBottom: '4rem' }}>
        {article.content}
      </div>

      <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '3rem' }}>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem' }}>Comments ({comments.length})</h3>

        {user ? (
          <form onSubmit={handleCommentSubmit} style={{ marginBottom: '3rem' }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts?"
              style={{
                width: '100%',
                padding: '1.25rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--card-border)',
                color: 'white',
                fontSize: '1rem',
                minHeight: '120px',
                resize: 'vertical',
                marginBottom: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--card-border)'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={commentLoading || !newComment.trim()}
                style={{ padding: '0.75rem 2rem' }}
              >
                {commentLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ padding: '2rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Please log in to join the conversation.</p>
            <Link to="/login" className="btn btn-outline" style={{ display: 'inline-flex' }}>Log In</Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)', border: '1px dashed var(--card-border)', borderRadius: '12px' }}>
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>
                      {comment.user?.name?.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 600 }}>{comment.user?.name}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>{comment.text}</p>
              </div>
            )).reverse()
          )}
        </div>
      </div>
      <SaveToCollectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        articleId={id} 
      />
    </div>
  );
};

export default ArticleDetail;
