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
    <div className={`app-layout ${isCollapsed ? 'collapsed' : ''}`}>
      <Sidebar 
        isCollapsed={isCollapsed} 
        isOpen={isMobileOpen} 
        toggleSidebar={() => setIsMobileOpen(!isMobileOpen)} 
      />
      
      <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <Topbar toggleSidebar={toggleSidebar} />
        
        <div className="content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
