import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { ThumbsUp, Calendar, User, ArrowLeft, Edit, Trash2, Bookmark, Share2, MessageCircle } from 'lucide-react';
import FollowButton from '../components/FollowButton';
import SaveToCollectionModal from '../components/SaveToCollectionModal';
import ShareArticleModal from '../components/ShareArticleModal';

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

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
      const { data } = await api.post(`/api/articles/${id}/comment`, { 
        text: newComment,
        parentId: replyTo?._id 
      });
      setComments(data);
      setNewComment('');
      setReplyTo(null);
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
            onClick={() => { if (!user) navigate('/login'); else setIsShareModalOpen(true); }}
            className={`btn btn-outline`}
            style={{ borderRadius: '50px', padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Share2 size={18} /> Share
          </button>

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
            {replyTo && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem 1rem', borderRadius: '8px 8px 0 0', border: '1px solid var(--card-border)', borderBottom: 'none' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>
                  Replying to <strong>{replyTo.author?.name}</strong>
                </span>
                <button 
                  type="button" 
                  onClick={() => setReplyTo(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
              </div>
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? "Write a reply..." : "What are your thoughts?"}
              style={{
                width: '100%',
                padding: '1.25rem',
                borderRadius: replyTo ? '0 0 12px 12px' : '12px',
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
                {commentLoading ? 'Posting...' : replyTo ? 'Post Reply' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ padding: '2rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Please log in to join the conversation.</p>
            <Link to="/login" className="btn btn-outline" style={{ display: 'inline-flex' }}>Log In</Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '1000px', overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)', border: '1px dashed var(--card-border)', borderRadius: '12px' }}>
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <CommentList 
              comments={comments} 
              onReply={(c) => {
                setReplyTo(c);
                window.scrollTo({ top: document.querySelector('form')?.offsetTop - 100, behavior: 'smooth' });
              }} 
            />
          )}
        </div>
      </div>
      <SaveToCollectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        articleId={id} 
      />
      <ShareArticleModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        articleId={id}
        articleTitle={article.title}
        articleCategory={typeof article.category === 'object' ? article.category.name : article.category}
      />
    </div>
  );
};

const CommentList = ({ comments, onReply, depth = 0 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginLeft: depth > 0 ? '2rem' : '0', borderLeft: depth > 0 ? '2px solid rgba(255,255,255,0.05)' : 'none', paddingLeft: depth > 0 ? '1rem' : '0' }}>
      {comments.map((comment) => (
        <div key={comment._id}>
          <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--card-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>
                  {comment.author?.name?.charAt(0)}
                </div>
                <span style={{ fontWeight: 600 }}>{comment.author?.name}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1rem' }}>{comment.text}</p>
            <button 
              onClick={() => onReply(comment)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0' }}
            >
              <MessageCircle size={14} /> Reply
            </button>
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <CommentList comments={comment.replies} onReply={onReply} depth={depth + 1} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ArticleDetail;
