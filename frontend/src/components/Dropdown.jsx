import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Dropdown = ({ options, selected, onSelect, placeholder = 'Select an option', label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className="dropdown-container" 
      ref={dropdownRef} 
      style={{ 
        width: '100%', 
        position: 'relative',
        zIndex: isOpen ? 1000 : 1 // Ensure container is above siblings when open
      }}
    >
      <div 
        className="dropdown-trigger glass-card"
        onClick={toggleDropdown}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.85rem 1.25rem',
          cursor: 'pointer',
          borderRadius: 'var(--radius)',
          border: isOpen ? '1px solid var(--primary)' : '1px solid var(--card-border)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          transition: 'var(--transition)'
        }}
      >
        <span style={{ color: selected ? 'white' : 'var(--text-secondary)' }}>
          {selected || placeholder}
        </span>
        <ChevronDown 
          size={20} 
          style={{ 
            color: 'var(--text-secondary)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.3s ease'
          }} 
        />
      </div>

      {isOpen && (
        <div 
          className="dropdown-menu glass-card animate-up"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            width: '100%',
            maxHeight: '250px',
            overflowY: 'auto',
            zIndex: 9999,
            padding: '0.5rem',
            animation: 'fadeInUp 0.15s ease-out',
            background: '#1e1b4b', // Solid dark background to prevent transparency overlap
            border: '1px solid var(--primary)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' // Added shadow for better separation
          }}
        >
          {options.map((option) => (
            <div
              key={option}
              className="dropdown-item"
              onClick={() => handleSelect(option)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'var(--transition)',
                backgroundColor: selected === option ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: selected === option ? 'var(--primary)' : 'white',
                marginBottom: '2px'
              }}
              onMouseEnter={(e) => {
                if (selected !== option) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (selected !== option) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{option}</span>
              {selected === option && <Check size={16} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
