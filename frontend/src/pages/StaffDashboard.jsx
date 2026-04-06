import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { LayoutDashboard, BookOpen, ThumbsUp, Activity, TrendingUp, Clock, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalArticles: 0, totalLikes: 0 });
  const [myArticles, setMyArticles] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, articlesRes] = await Promise.all([
          api.get('/api/users/dashboard'),
          api.get('/api/articles/my')
        ]);
        setStats(statsRes.data);
        setMyArticles(articlesRes.data);
        setRecentArticles(articlesRes.data.slice(0, 5));
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
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Staff Console</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your articles and review performance metrics.</p>
        </div>
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '50px', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
          Authenticated: {user?.name}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard 
          icon={<BookOpen size={24} color="#6366f1" />} 
          label="Your Articles" 
          value={myArticles.length} 
          color="rgba(99, 102, 241, 0.1)"
        />
        <StatCard 
          icon={<ThumbsUp size={24} color="#ec4899" />} 
          label="Impact Score" 
          value={stats.totalLikes} 
          color="rgba(236, 72, 153, 0.1)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} /> My Contributions
          </h2>
          {recentArticles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You haven't published any articles yet.</p>
              <Link to="/create-article" className="btn btn-primary">Start Writing</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentArticles.map(article => (
                <Link key={article._id} to={`/articles/${article._id}`} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.3s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '8px' }}>
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{article.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(article.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <ThumbsUp size={16} /> {article.likes.length}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Author Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/create-article" className="btn btn-primary" style={{ justifyContent: 'center', gap: '0.5rem' }}>
              <PlusCircle size={18} /> Create New Article
            </Link>
            <Link to="/articles" className="btn btn-outline" style={{ justifyContent: 'center' }}>Review Public Repo</Link>
            <Link to="/profile" className="btn btn-outline" style={{ justifyContent: 'center' }}>Organization Profile</Link>
          </div>
          
          <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}>Staff Notice:</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Weekly content audit scheduled for Friday. Please ensure all sensitive articles are properly categorized.</p>
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

export default StaffDashboard;
