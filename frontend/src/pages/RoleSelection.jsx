import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ShieldCheck, Users, Lock } from 'lucide-react';

const RoleSelection = () => {
  const { setRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    localStorage.setItem('role', role); // Direct set as requested
    setRole(role);
    navigate('/signup');
  };

  return (
    <div className="auth-container animate-up">
      <div className="auth-card glass-card">
        <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Identify Access Level</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Select your role to enter the secure environment. Your workspace is configured based on your credentials.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div 
            className="glass-card" 
            style={{ 
              padding: '1.5rem', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem' 
            }}
            onClick={() => handleRoleSelect('staff')}
          >
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.75rem', borderRadius: '12px' }}>
              <ShieldCheck color="#6366f1" size={24} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Staff Member</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Operational access to records, internal assets, and standard workflow tools.
              </p>
            </div>
          </div>

          <div 
            className="glass-card" 
            style={{ 
              padding: '1.5rem', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem' 
            }}
            onClick={() => handleRoleSelect('customer')}
          >
            <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '0.75rem', borderRadius: '12px' }}>
              <Users color="#ec4899" size={24} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Customer</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Personal vault access, secure messaging, and account transaction history.
              </p>
            </div>
          </div>
        </div>

        <p style={{ marginTop: '2.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          SENTINEL CORE PROTOCOL V2.4
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
