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

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'staff') return '/staff-dashboard';
    return '/customer-dashboard';
  };

  return (
    <header className="topbar" style={{ position: 'relative', zIndex: 100 }}>
      <div className="topbar-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button className="sidebar-toggle-btn" onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Menu size={24} />
          </button>
          <Link to="/" className="topbar-logo" style={{ textDecoration: 'none', color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
            KnowledgeRepo
          </Link>
        </div>

        <div className="topbar-actions">
          {user ? (
            <div className="profile-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
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
                  className="dropdown-menu animate-up"
                  style={{
                    position: 'absolute',
                    top: '60px',
                    right: 0,
                    minWidth: '180px',
                    background: '#0f172a',
                    borderRadius: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                    padding: '0.5rem',
                    zIndex: 9999
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
                    style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', margin: 0, textAlign: 'left', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
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
