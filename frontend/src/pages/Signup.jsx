import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { User, Mail, Lock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const selectedRole = localStorage.getItem('role') || 'customer';
    const result = await register({ name, email, username, password, role: selectedRole });
    if (!result.success) {
      setError(result.message || 'Registration failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container animate-up">
      <div className="auth-card glass-card">
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Secure your digital legacy.</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', textAlign: 'center' }}>
          Enter the vault to begin your journey.
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe"
                required 
              />
              <User size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            </div>
          </div>

          <div className="input-group">
            <label>Username</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="johndoe123"
                required 
              />
              <User size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="name@company.com"
                required 
              />
              <Mail size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            </div>
          </div>

          <div className="input-group">
            <label>Security Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
              <Lock size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            </div>
          </div>


          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', padding: '1rem' }}>
            Create Account &rarr;
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
          Already have a vault? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in here</Link>
        </p>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span>Privacy Shield</span>
          <span>Terms of Entry</span>
          <span>Security Audit</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
