import React, { useState, useEffect } from 'react';
import api from '../api';
import { X, Send, Search, CheckCircle2 } from 'lucide-react';

const ShareArticleModal = ({ isOpen, onClose, articleId, articleTitle, articleCategory }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(null); // stores the userId currently being sent to
  const [sentTo, setSentTo] = useState([]); // stores userIds already sent to

  useEffect(() => {
    if (isOpen) {
      const fetchFollowing = async () => {
        setLoading(true);
        try {
          const { data } = await api.get('/api/users/following');
          setFollowing(data);
        } catch (error) {
          console.error('Error fetching following:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchFollowing();
      setSentTo([]);
    }
  }, [isOpen]);

  const handleShare = async (receiverId) => {
    setSending(receiverId);
    try {
      await api.post('/api/chat/send', { receiverId, articleId });
      setSentTo([...sentTo, receiverId]);
    } catch (error) {
      console.error('Error sharing article:', error);
      alert('Failed to share article');
    } finally {
      setSending(null);
    }
  };

  if (!isOpen) return null;

  const filteredFollowing = following.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-card animate-up" style={{
        width: '100%',
        maxWidth: '450px',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '20px',
        padding: '2rem',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: 'white',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Share Article</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Send this article to your community
        </p>

        <div style={{ 
          background: 'rgba(99, 102, 241, 0.05)', 
          padding: '1rem', 
          borderRadius: '12px', 
          border: '1px solid rgba(99, 102, 241, 0.1)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '8px', background: 'var(--primary)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700
            }}>
              {articleTitle.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{articleTitle}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{articleCategory}</div>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text"
            placeholder="Search following..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--card-border)',
              color: 'white',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="loader"></div></div>
          ) : filteredFollowing.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
               No followers found matching your search.
             </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredFollowing.map(u => (
                <div key={u._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid transparent',
                  transition: 'background 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{u.username}</div>
                    </div>
                  </div>
                  
                  {sentTo.includes(u._id) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} /> Sent
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleShare(u._id)}
                      disabled={sending === u._id}
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      {sending === u._id ? 'Sending...' : <><Send size={14} /> Send</>}
                    </button>
                  ) }
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareArticleModal;
