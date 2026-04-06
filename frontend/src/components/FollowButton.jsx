import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { UserPlus, UserMinus, Users } from 'lucide-react';

const FollowButton = ({ targetUserId, initialIsFollowing = null, initialIsMutual = false, initialIsFollowedBy = false, onToggle = null }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isFollowedBy, setIsFollowedBy] = useState(initialIsFollowedBy);
  const [isMutual, setIsMutual] = useState(initialIsMutual);
  const [loading, setLoading] = useState(initialIsFollowing === null);

  useEffect(() => {
    const checkFollowing = async () => {
      try {
        const { data } = await axios.get(`/api/users/${targetUserId}`);
        setIsFollowing(data.isFollowing);
        setIsFollowedBy(data.isFollowedBy);
        setIsMutual(data.isMutual);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching follow status:', error);
        setLoading(false);
      }
    };

    if (user && targetUserId && initialIsFollowing === null) {
      checkFollowing();
    } else {
      setIsFollowing(initialIsFollowing);
      setLoading(false);
    }
  }, [targetUserId, user, initialIsFollowing]);

  const handleFollowToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;

    try {
      if (isFollowing) {
        await axios.post(`/api/users/unfollow/${targetUserId}`);
        setIsFollowing(false);
        setIsMutual(false);
        if (onToggle) onToggle(false);
      } else {
        await axios.post(`/api/users/follow/${targetUserId}`);
        setIsFollowing(true);
        if (isFollowedBy) setIsMutual(true);
        if (onToggle) onToggle(true);
      }
    } catch (error) {
      console.error('Follow toggle failed:', error);
    }
  };

  if (loading || !user || user._id === targetUserId) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
      <button 
        onClick={handleFollowToggle}
        className="btn"
        style={{ 
          background: isFollowing ? 'rgba(75, 85, 99, 0.2)' : 'var(--primary)',
          color: 'white',
          border: isFollowing ? '1px solid rgba(75, 85, 99, 0.5)' : 'none',
          padding: '0.4rem 1rem',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          borderRadius: '50px',
          transition: 'all 0.3s ease',
          fontWeight: 600
        }}
      >
        {isFollowing ? <UserMinus size={14} /> : <UserPlus size={14} />}
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
      {isMutual && (
        <span style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Users size={12} /> Mutual
        </span>
      )}
      {!isMutual && isFollowedBy && (
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Follows you
        </span>
      )}
    </div>
  );
};

export default FollowButton;
