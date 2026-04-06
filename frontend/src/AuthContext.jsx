import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(localStorage.getItem('role') || null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (identifier, password) => {
    try {
      const { data } = await api.post('/api/auth/login', { 
        identifier, 
        password 
      });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (data.role === 'staff') {
        navigate('/staff-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/api/auth/register', userData);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (data.role === 'staff') {
        navigate('/staff-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const setRole = (role) => {
    setSelectedRole(role);
    localStorage.setItem('role', role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, selectedRole, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};
