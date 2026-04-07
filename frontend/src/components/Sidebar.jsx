import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Folder, 
  Bookmark, 
  MessageSquare, 
  LayoutDashboard, 
  PlusCircle,
  Users,
  X,
  Layers
} from 'lucide-react';
import { useAuth } from '../AuthContext';

const Sidebar = ({ collapsed }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Explore', path: '/articles', icon: <Compass size={20} /> },
    { label: 'Categories', path: '/categories', icon: <Folder size={20} /> },
    { label: 'Collections', path: '/collections', icon: <Bookmark size={20} /> },
    { label: 'Users', path: '/users', icon: <Users size={20} /> },
    { label: 'Chat', path: '/chat', icon: <MessageSquare size={20} /> },
  ];

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'staff') return '/staff-dashboard';
    return '/customer-dashboard';
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-header" style={{ padding: 0, border: 'none', height: 'auto', textDecoration: 'none', color: 'inherit' }}>
          <div className="logo-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="logo-container" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', borderRadius: '6px' }}>
              <img 
                src="/logo.png" 
                className="logo" 
                alt="L" 
                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
              <Layers size={18} color="white" style={{ position: 'absolute' }} />
            </div>
            {!collapsed && <span>KnowledgeRepo</span>}
          </div>
        </Link>
      </div>

        <div className="sidebar-nav">
          {!collapsed && <div className="sidebar-label">Main Menu</div>}
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              {item.icon}
              {!collapsed && <span className="label">{item.label}</span>}
            </Link>
          ))}

          {user && (
            <>
              {!collapsed && <div className="sidebar-divider"></div>}
              {!collapsed && <div className="sidebar-label">User</div>}
              <Link
                to={getDashboardPath()}
                className={`sidebar-item ${isActive(getDashboardPath()) ? 'active' : ''}`}
                title={collapsed ? 'Dashboard' : ''}
              >
                <LayoutDashboard size={20} />
                {!collapsed && <span className="label">Dashboard</span>}
              </Link>

              {user.role === 'staff' && !collapsed && (
                <Link
                  to="/create-article"
                  className={`sidebar-item ${isActive('/create-article') ? 'active' : ''}`}
                >
                  <PlusCircle size={20} />
                  <span className="label">Create Article</span>
                </Link>
              )}
            </>
          )}
        </div>
      </aside>
    );
};

export default Sidebar;
