import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RoleSelection from './pages/RoleSelection';
import ArticlesList from './pages/ArticlesList';
import ArticleDetail from './pages/ArticleDetail';
import CreateEditArticle from './pages/CreateEditArticle';
import Profile from './pages/Profile';
import UsersSearch from './pages/UsersSearch';
import StaffDashboard from './pages/StaffDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import Chat from './pages/Chat';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import Categories from './pages/Categories';
import CategoryArticles from './pages/CategoryArticles';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

import Layout from './components/Layout';

const AppContent = () => {
  return (
    <Routes>
      {/* Layout wraps all protected and public navigation pages */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/articles" element={<ArticlesList />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/search-users" element={
          <ProtectedRoute><UsersSearch /></ProtectedRoute>
        } />
        
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:id" element={<CategoryArticles />} />
        
        <Route path="/create-article" element={
          <ProtectedRoute allowedRoles={['staff']}><CreateEditArticle /></ProtectedRoute>
        } />
        <Route path="/edit-article/:id" element={
          <ProtectedRoute allowedRoles={['staff']}><CreateEditArticle /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute><Chat /></ProtectedRoute>
        } />
        <Route path="/collections" element={
          <ProtectedRoute><Collections /></ProtectedRoute>
        } />
        <Route path="/collections/:id" element={
          <ProtectedRoute><CollectionDetail /></ProtectedRoute>
        } />
        <Route path="/staff-dashboard" element={
          <ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>
        } />
        <Route path="/customer-dashboard" element={
          <ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
      </Route>

      {/* Pages without sidebar/topbar (optional) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/select-role" element={<RoleSelection />} />
      <Route path="/dashboard" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
