import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, selectedRole } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(identifier, password);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container animate-up">
      <div className="auth-card glass-card">
        <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Welcome</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Secure access to your encrypted digital assets and identity.
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email or Username</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)} 
                placeholder="Enter email or username"
                required 
              />
              {identifier.includes('@') ? (
                <Mail size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              ) : (
                <User size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              )}
            </div>
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Password</label>
              <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Forgot Password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
              <div 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            Log In
          </button>
        </form>

        <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
          New to the platform? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
