import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="layout">
      <Sidebar collapsed={isCollapsed} />
      
      <div className="main">
        <Topbar toggleSidebar={toggleSidebar} />
        
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
