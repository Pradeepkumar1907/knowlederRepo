import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { LayoutDashboard, BookOpen, ThumbsUp, Bookmark, Search, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ viewsCount: 0, likesCount: 0, bookmarksCount: 0 });
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, profileRes] = await Promise.all([
          axios.get('/api/dashboard/customer'),
          axios.get('/api/users/profile')
        ]);
        setStats(statsRes.data);
        setRecentlyViewed(profileRes.data.recentlyViewed || []);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div className="animate-up" style={{ padding: '4rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Personal Library</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, explore the latest in the knowledge repository.</p>
        </div>
        <div style={{ padding: '0.5rem 1.5rem', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', borderRadius: '50px', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={16} /> Customer Mode
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard 
          icon={<BookOpen size={24} color="#6366f1" />} 
          label="Knowledge Access" 
          value={stats.viewsCount} 
          color="rgba(99, 102, 241, 0.1)"
        />
        <StatCard 
          icon={<ThumbsUp size={24} color="#ec4899" />} 
          label="Articles Liked" 
          value={stats.likesCount || 0} 
          color="rgba(236, 72, 153, 0.1)"
        />
        <StatCard 
          icon={<Bookmark size={24} color="#10b981" />} 
          label="Bookmarks" 
          value={stats.bookmarksCount || 0} 
          color="rgba(16, 185, 129, 0.1)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} /> Recently Viewed
          </h2>
          {recentlyViewed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '15px' }}>
              <Clock size={48} style={{ color: 'rgba(255, 255, 255, 0.1)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>You haven't viewed any articles recently.</p>
              <Link to="/articles" className="btn btn-outline" style={{ marginTop: '1.5rem' }}>Start Exploring</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentlyViewed.map(article => (
                <Link key={article._id} to={`/articles/${article._id}`} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '8px' }}>
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{article.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{typeof article.category === 'object' && article.category !== null ? article.category.name : article.category}</div>
                    </div>
                  </div>
                  <Clock size={18} color="var(--primary)" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Discover</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/articles" className="btn btn-primary" style={{ justifyContent: 'center', gap: '0.5rem' }}>
              <Search size={18} /> Explore Repository
            </Link>
            <Link to="/profile" className="btn btn-outline" style={{ justifyContent: 'center' }}>My Interest Profile</Link>
          </div>
          
          <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(236, 72, 153, 0.05)', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.1)' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ec4899' }}>Curated Recommendation:</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Based on your recent likes, we recommend checking out the "Advanced React Patterns" series.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
    <div style={{ background: color, padding: '1rem', borderRadius: '15px' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{value}</div>
    </div>
  </div>
);

export default CustomerDashboard;
