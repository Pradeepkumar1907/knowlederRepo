import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { BookOpen, User, LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="nav-logo">
          KnowledgeRepo 2.0
        </Link>
        <div className="nav-links">
          <Link to="/articles" className="nav-item">Explore</Link>
          <Link to="/categories" className="nav-item">Categories</Link>
          <Link to="/collections" className="nav-item">Collections</Link>
          <Link to="/search-users" className="nav-item">Search</Link>
          <Link to="/chat" className="nav-item">Chat</Link>
          {user ? (
            <>
              <Link 
                to={user.role === 'admin' ? "/admin-dashboard" : user.role === 'staff' ? "/staff-dashboard" : "/customer-dashboard"} 
                className="nav-item flex gap-1"
              >
                Dashboard
              </Link>
              {user.role === 'staff' && (
                <Link to="/create-article" className="nav-item flex gap-1">
                  {/* <PlusCircle size={18} /> */}
                  Create
                </Link>
              )}
              <Link to="/profile" className="nav-item flex gap-1">
                {/* <User size={18} /> */}
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span>{user.name}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{user.role}</span>
                </div>
              </Link>
              <button onClick={logout} className="btn-outline btn flex gap-1">
                {/* <LogOut size={18} /> */}
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline btn">Login</Link>
              <Link to="/select-role" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
