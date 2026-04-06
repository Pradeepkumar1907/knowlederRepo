import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { User, Book, Heart, Settings, Shield, UserPlus, UserMinus, Users, MessageSquare } from 'lucide-react';

const Profile = () => {
  const { user: currentUser } = useAuth();
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowedBy, setIsFollowedBy] = useState(false);
  const [isMutual, setIsMutual] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const navigate = useNavigate();

  const isOwnProfile = !id || id === currentUser?._id;

  const handleStartChat = async () => {
    try {
      const { data } = await api.post(`/api/chat/${id}`);
      navigate('/chat');
    } catch (error) {
      console.error('Failed to start chat', error);
      alert(error.response?.data?.message || 'Could not start chat. You need to follow this user first.');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const endpoint = isOwnProfile ? '/api/users/profile' : `/api/users/${id}`;
        const { data } = await api.get(endpoint);
        
        if (isOwnProfile) {
          setProfileData(data);
          // Use fresh user data from API instead of stale context data
          setFollowersCount(data.user.followers?.length || 0);
        } else {
          setProfileData({
            user: data.user,
            myArticles: data.articles,
            recentlyViewed: [] // Public profile might not show recently viewed
          });
          setIsFollowing(data.isFollowing);
          setIsFollowedBy(data.isFollowedBy);
          setIsMutual(data.isMutual);
          setFollowersCount(data.followersCount);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, isOwnProfile, currentUser]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await api.post(`/api/users/unfollow/${id}`);
        setIsFollowing(false);
        setIsMutual(false);
        setFollowersCount(prev => prev - 1);
      } else {
        await api.post(`/api/users/follow/${id}`);
        setIsFollowing(true);
        if (isFollowedBy) setIsMutual(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Follow toggle failed', error);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="loader"></div>
    </div>
  );

  if (!profileData) return <div style={{ textAlign: 'center', padding: '5rem' }}>User not found</div>;

  // Use profileData.user (fresh from API) even for the current user to ensure counts are updated
  const displayUser = profileData.user;

  return (
    <div className="animate-up" style={{ padding: '4rem 0' }}>
      <div className="glass-card" style={{ padding: '3rem', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ 
          width: '120px', 
          height: '120px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '3rem', 
          fontWeight: 800,
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
        }}>
          {displayUser?.name?.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{displayUser?.name}</h1>
            {!isOwnProfile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button 
                    onClick={handleFollowToggle}
                    className="btn-primary"
                    style={{ 
                      background: isFollowing ? 'rgba(75, 85, 99, 0.2)' : 'var(--primary)',
                      border: isFollowing ? '1px solid rgba(75, 85, 99, 0.5)' : 'none',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.5rem',
                      fontSize: '0.9rem',
                      borderRadius: '50px'
                    }}
                  >
                    {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                  {isFollowing && (
                    <button 
                      onClick={handleStartChat}
                      className="btn-secondary"
                      style={{ 
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1.5rem',
                        fontSize: '0.9rem',
                        borderRadius: '50px'
                      }}
                    >
                      <MessageSquare size={18} /> Message
                    </button>
                  )}
                  {isMutual && (
                    <div style={{ 
                      background: 'rgba(34, 197, 94, 0.1)', 
                      color: '#22c55e', 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem', 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      border: '1px solid rgba(34, 197, 94, 0.3)'
                    }}>
                      <Users size={14} /> Mutual
                    </div>
                  )}
                  {!isMutual && isFollowedBy && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
                      Follows you
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Shield size={18} /> {displayUser?.role?.toUpperCase()} | @{displayUser?.username}
          </p>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{profileData.myArticles.length}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Articles</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{followersCount}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Followers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{displayUser?.following?.length || 0}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Following</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--card-border)' }}>
        <button 
          onClick={() => setActiveTab('my')} 
          style={{ 
            padding: '1rem 0', 
            background: 'none', 
            color: activeTab === 'my' ? 'var(--primary)' : 'var(--text-secondary)', 
            fontWeight: 600,
            borderBottom: activeTab === 'my' ? '2px solid var(--primary)' : 'none',
            fontSize: '1.1rem',
            cursor: 'pointer'
          }}
        >
          {isOwnProfile ? 'My Contributions' : 'Articles'} ({profileData.myArticles.length})
        </button>
        {isOwnProfile && (
          <button 
            onClick={() => setActiveTab('viewed')} 
            style={{ 
              padding: '1rem 0', 
              background: 'none', 
              color: activeTab === 'viewed' ? 'var(--primary)' : 'var(--text-secondary)', 
              fontWeight: 600,
              borderBottom: activeTab === 'viewed' ? '2px solid var(--primary)' : 'none',
              fontSize: '1.1rem',
              cursor: 'pointer'
            }}
          >
            Recently Viewed ({profileData.recentlyViewed?.length || 0})
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {activeTab === 'my' ? (
          profileData.myArticles.length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No articles found.</p>
          ) : (
            profileData.myArticles.map(article => (
              <ArticleCard key={article._id} article={article} />
            ))
          )
        ) : (
          (profileData.recentlyViewed || []).length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>You haven't viewed any articles recently.</p>
          ) : (
            profileData.recentlyViewed.map(article => (
              <ArticleCard key={article._id} article={article} />
            ))
          )
        )}
      </div>
    </div>
  );
};

const ArticleCard = ({ article }) => (
  <Link to={`/articles/${article._id}`} className="glass-card" style={{ padding: '1.5rem', transition: 'transform 0.3s' }}>
    <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-block', marginBottom: '0.75rem' }}>
      {typeof article.category === 'object' && article.category !== null ? article.category.name : article.category}
    </div>
    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{article.title}</h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
      {article.content}
    </p>
    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
      {new Date(article.createdAt).toLocaleDateString()}
    </div>
  </Link>
);

export default Profile;
