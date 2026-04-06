import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { Search, User, Users, Shield } from 'lucide-react';
import FollowButton from '../components/FollowButton';

const UsersSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await api.get(`/api/users/search?query=${query}`);
        setResults(data);
        setError(null);
      } catch (error) {
        console.error('Search error:', error);
        setError(error.response?.status === 404 
          ? 'Search endpoint not found. Please ensure the backend is running and routes are correctly configured.'
          : (error.response?.data?.message || 'Failed to search users.'));
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <div className="animate-up" style={{ padding: '4rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Find Contributors</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Discover and follow other researchers, authors, and staff members in the Knowledge Repository.
        </p>
        
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          <input 
            type="text" 
            placeholder="Search by name or username..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="glass-card"
            style={{ 
              width: '100%', 
              padding: '1.25rem 3.5rem 1.25rem 1.5rem', 
              border: '1px solid var(--card-border)', 
              background: 'rgba(255, 255, 255, 0.05)', 
              color: 'white', 
              borderRadius: '50px',
              fontSize: '1.1rem'
            }}
            autoFocus
          />
          <Search style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} size={24} />
        </div>
      </div>

      {error && (
        <div className="glass-card animate-up" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <p style={{ color: '#fca5a5', margin: 0 }}>{error}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Tip: Try restarting your backend server with <code>npm run dev</code> in the backend folder.
          </p>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="loader"></div>
        </div>
      ) : results.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {results.map(user => (
            <div key={user._id} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.3s ease' }}>
              <Link to={`/profile/${user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '2rem', 
                  fontWeight: 800,
                  marginBottom: '1.5rem',
                  boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
                }}>
                  {user.name.charAt(0)}
                </div>
              </Link>
              
              <Link to={`/profile/${user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{user.name}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>@{user.username}</p>
              </Link>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
                <Shield size={14} /> {user.role.toUpperCase()}
              </p>
              
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem', width: '100%', justifyContent: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user.followersCount}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Followers</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user.followingCount}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Following</div>
                </div>
              </div>
              
              <FollowButton 
                targetUserId={user._id} 
                initialIsFollowing={user.isFollowing} 
                initialIsMutual={user.isMutual} 
                initialIsFollowedBy={user.isFollowedBy} 
              />
            </div>
          ))}
        </div>
      ) : query.trim() !== '' ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No users found matching "{query}"</h3>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
          <p>Start typing to search for people...</p>
        </div>
      )}
    </div>
  );
};

export default UsersSearch;
