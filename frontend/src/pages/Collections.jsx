import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Folder, Trash2, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../AuthContext';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const { data } = await api.get('/api/collections');
      setCollections(data);
    } catch (error) {
      console.error(error);
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
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const deleteCollection = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        await api.delete(`/api/collections/${id}`);
        setCollections(collections.filter(c => c._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}><div className="loader"></div></div>;

  return (
    <div className="animate-up" style={{ padding: '4rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem' }}>My Collections</h1>

        <form onSubmit={createCollection} style={{ display: 'flex', gap: '0.5rem', width: '300px' }}>
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
      </div>

      {collections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
          <Folder size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--text-secondary)', opacity: 0.5 }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No collections yet</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Create a collection to start saving articles for later.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {collections.map(collection => (
            <div 
              key={collection._id} 
              onClick={() => navigate(`/collections/${collection._id}`)}
              className="glass-card" 
              style={{ padding: '2rem', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                  <Folder size={32} color="var(--primary)" fill="rgba(99, 102, 241, 0.2)" />
                </div>
                <button 
                  onClick={(e) => deleteCollection(e, collection._id)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', transition: 'background 0.3s' }}
                  className="hover-bg-red"
                  title="Delete Collection"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{collection.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {collection.articles?.length || 0} {(collection.articles?.length === 1) ? 'article' : 'articles'}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, marginTop: 'auto' }}>
                View Articles <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Collections;
