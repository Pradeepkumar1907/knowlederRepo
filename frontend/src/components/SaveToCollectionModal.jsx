import React, { useState, useEffect } from 'react';
import api from '../api';
import { X, Plus, Folder, Check } from 'lucide-react';

const SaveToCollectionModal = ({ isOpen, onClose, articleId }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
      setError('');
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/collections');
      setCollections(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    setCreating(true);
    try {
      const { data } = await api.post('/api/collections', { name: newCollectionName });
      setCollections([data, ...collections]);
      setNewCollectionName('');
      // Optionally auto-save right after creating? Let's keep it simple and just create it.
    } catch (err) {
      console.error(err);
      setError('Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const saveToCollection = async (collectionId) => {
    setSavingId(collectionId);
    setError('');
    try {
      await api.post(`/api/collections/${collectionId}/add`, { articleId });
      // Update local state to reflect it's saved
      setCollections(collections.map(c => {
        if (c._id === collectionId) {
          return { ...c, articles: [...c.articles, articleId] };
        }
        return c;
      }));
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save to collection');
    } finally {
      setSavingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div 
        className="glass-card" 
        style={{ 
          width: '90%', maxWidth: '400px', padding: '2rem', borderRadius: '16px', position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Save to Collection</h2>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={createCollection} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            placeholder="New Collection Name" 
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
          />
          <button type="submit" disabled={creating || !newCollectionName.trim()} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
            {creating ? '...' : <Plus size={20} />}
          </button>
        </form>

        <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="custom-scrollbar">
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>Loading...</div>
          ) : collections.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', fontSize: '0.9rem' }}>
              No collections yet. Create one above!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {collections.map(c => {
                const isSaved = c.articles.includes(articleId);
                return (
                  <button
                    key={c._id}
                    onClick={() => !isSaved && saveToCollection(c._id)}
                    disabled={isSaved || savingId === c._id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '1rem', borderRadius: '8px', border: '1px solid var(--card-border)',
                      background: 'rgba(255,255,255,0.02)', cursor: isSaved ? 'default' : 'pointer',
                      color: isSaved ? 'var(--text-secondary)' : 'white',
                      transition: 'background 0.2s'
                    }}
                    className={!isSaved ? 'hover-bg-light' : ''}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Folder size={18} color={isSaved ? 'var(--text-secondary)' : 'var(--primary)'} />
                      <span style={{ fontWeight: 500 }}>{c.name}</span>
                    </div>
                    {savingId === c._id ? (
                      <span style={{ fontSize: '0.8rem' }}>Saving...</span>
                    ) : isSaved ? (
                      <Check size={18} color="#10b981" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveToCollectionModal;
