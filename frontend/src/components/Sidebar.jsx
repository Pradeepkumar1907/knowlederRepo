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
  X
} from 'lucide-react';
import { useAuth } from '../AuthContext';

const Sidebar = ({ isOpen, toggleSidebar, isCollapsed }) => {
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
    <>
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="nav-logo" onClick={() => isOpen && toggleSidebar()}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ width: '32px', height: '32px', display: 'block' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            {!isCollapsed && <span className="logo-text">KnowledgeRepo</span>}
          </Link>
          <button className="mobile-toggle" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <div className="sidebar-nav">
          {!isCollapsed && <div className="sidebar-label">Main Menu</div>}
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
              title={isCollapsed ? item.label : ''}
              onClick={() => isOpen && toggleSidebar()}
            >
              {item.icon}
              {!isCollapsed && <span className="label">{item.label}</span>}
            </Link>
          ))}

          {user && (
            <>
              {!isCollapsed && <div className="sidebar-divider"></div>}
              {!isCollapsed && <div className="sidebar-label">User</div>}
              <Link
                to={getDashboardPath()}
                className={`sidebar-item ${isActive(getDashboardPath()) ? 'active' : ''}`}
                title={isCollapsed ? 'Dashboard' : ''}
                onClick={() => isOpen && toggleSidebar()}
              >
                <LayoutDashboard size={20} />
                {!isCollapsed && <span className="label">Dashboard</span>}
              </Link>

              {user.role === 'staff' && !isCollapsed && (
                <Link
                  to="/create-article"
                  className={`sidebar-item ${isActive('/create-article') ? 'active' : ''}`}
                  onClick={() => isOpen && toggleSidebar()}
                >
                  <PlusCircle size={20} />
                  <span className="label">Create Article</span>
                </Link>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
