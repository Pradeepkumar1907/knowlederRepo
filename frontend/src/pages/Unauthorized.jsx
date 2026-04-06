import React from 'react';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      height: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div className="animate-up" style={{
        background: 'rgba(239, 68, 68, 0.1)',
        padding: '3rem',
        borderRadius: '30px',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        maxWidth: '500px'
      }}>
        <ShieldAlert size={80} color="#ef4444" style={{ marginBottom: '2rem' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#ef4444' }}>Access Denied</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Your current security clearance (role) does not permit access to this sector. 
          Please contact system administration if you believe this is an error.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline" 
            style={{ gap: '0.5rem' }}
          >
            <ArrowLeft size={18} /> Go Back
          </button>
          <Link to="/" className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <Home size={18} /> Return Home
          </Link>
        </div>
      </div>
      <div style={{ marginTop: '3rem', fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '2px' }}>
        ERR_CODE: 403_FORBIDDEN_ZONE
      </div>
    </div>
  );
};

export default Unauthorized;
