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
      // If query is empty, we can show all users or nothing. The user said "Search: name OR email".
      // Let's show nothing if empty to match previous behavior, or maybe a default list?
      // "Below show users list:" suggests it might show something even without search, but "Search by name or email" is the trigger.
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await api.get(`/api/users/search?q=${query}`);
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
    <div className="animate-up" style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Discover Users</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Find and connect with other members of the Knowledge Repository.
        </p>
        
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <input 
            type="text" 
            placeholder="Search by name or email" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="glass-card"
            style={{ 
              width: '100%', 
              padding: '1rem 3.5rem 1rem 1.25rem', 
              border: '1px solid var(--card-border)', 
              background: 'rgba(255, 255, 255, 0.05)', 
              color: 'white', 
              borderRadius: '12px',
              fontSize: '1rem'
            }}
            autoFocus
          />
          <Search style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} size={20} />
        </div>
      </div>

      {error && (
        <div className="glass-card animate-up" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <p style={{ color: '#fca5a5', margin: 0 }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="loader"></div>
        </div>
      ) : results.length > 0 ? (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
            {results.length} Users found
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {results.map((user, index) => (
              <div 
                key={user._id} 
                style={{ 
                  padding: '1.25rem 1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderBottom: index === results.length - 1 ? 'none' : '1px solid var(--card-border)',
                  background: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                  transition: 'background 0.2s ease'
                }}
                className="user-list-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <Link to={`/profile/${user._id}`}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '1.2rem', 
                      fontWeight: 800,
                      color: 'white',
                      boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)'
                    }}>
                      {user.name.charAt(0)}
                    </div>
                  </Link>
                  
                  <div>
                    <Link to={`/profile/${user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h4 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>{user.name}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.1rem 0 0' }}>{user.email}</p>
                    </Link>
                  </div>

                  <div style={{ marginLeft: '2rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {user.role}
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
        </div>
      ) : query.trim() !== '' ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No users found matching "{query}"</h3>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
          <p>Start typing to discover contributors...</p>
        </div>
      )}
    </div>
  );
};

export default UsersSearch;
