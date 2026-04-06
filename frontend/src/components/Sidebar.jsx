import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Folder, 
  Bookmark, 
  MessageSquare, 
  LayoutDashboard, 
  PlusCircle,
  X
} from 'lucide-react';
import { useAuth } from '../AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Explore', path: '/articles', icon: <Compass /> },
    { label: 'Categories', path: '/categories', icon: <Folder /> },
    { label: 'Collections', path: '/collections', icon: <Bookmark /> },
    { label: 'Chat', path: '/chat', icon: <MessageSquare /> },
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
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="nav-logo" onClick={() => isOpen && toggleSidebar()}>
            KnowledgeRepo
          </Link>
          <button className="mobile-toggle" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-label">Main Menu</div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => isOpen && toggleSidebar()}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          {user && (
            <>
              <div className="sidebar-divider"></div>
              <div className="sidebar-label">User</div>
              <Link
                to={getDashboardPath()}
                className={`sidebar-item ${isActive(getDashboardPath()) ? 'active' : ''}`}
                onClick={() => isOpen && toggleSidebar()}
              >
                <LayoutDashboard />
                Dashboard
              </Link>

              {user.role === 'staff' && (
                <Link
                  to="/create-article"
                  className={`sidebar-item ${isActive('/create-article') ? 'active' : ''}`}
                  onClick={() => isOpen && toggleSidebar()}
                >
                  <PlusCircle />
                  Create Article
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
