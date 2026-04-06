import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Menu, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../AuthContext';

const Topbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(`/articles?search=${e.target.value}`);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'staff') return '/staff-dashboard';
    return '/customer-dashboard';
  };

  return (
    <header className="topbar">
      <div className="topbar-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="mobile-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search articles, topics or authors..." 
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        <div className="topbar-actions">
          {user ? (
            <div className="user-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
              <div 
                className="user-profile-trigger" 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  cursor: 'pointer',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{user.role}</div>
                </div>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: 'var(--primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={16} />
              </div>

              {showDropdown && (
                <div 
                  className="dropdown-menu glass-card animate-up"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '200px',
                    padding: '0.5rem',
                    zIndex: 1000
                  }}
                >
                  <Link to="/profile" className="sidebar-item" style={{ margin: 0 }} onClick={() => setShowDropdown(false)}>
                    <User size={18} />
                    Profile
                  </Link>
                  <Link to={getDashboardPath()} className="sidebar-item" style={{ margin: 0 }} onClick={() => setShowDropdown(false)}>
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                  <div className="sidebar-divider" style={{ margin: '0.5rem 0' }}></div>
                  <button 
                    onClick={() => { logout(); setShowDropdown(false); }} 
                    className="sidebar-item" 
                    style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', margin: 0 }}
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/login" className="btn-outline btn" style={{ padding: '0.5rem 1rem' }}>Login</Link>
              <Link to="/select-role" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
