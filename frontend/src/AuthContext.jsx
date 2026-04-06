import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
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
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (identifier, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { 
        identifier, 
        password 
      });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
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
      const { data } = await axios.post('/api/auth/register', userData);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
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
    delete axios.defaults.headers.common['Authorization'];
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
