import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, Book } from 'lucide-react';
import FollowButton from '../components/FollowButton';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await api.get('/api/articles');
        setArticles(data.slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="animate-up">
      <header style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
          The <span style={{ color: 'var(--primary)' }}>Knowledge</span> Repository <br /> for Modern Teams.
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
          Accelerate your collective intelligence with our secure, role-based platform. 
          Manage articles, share insights, and track contributions with ease.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/articles" className="btn btn-primary">
            Explore Repository <ArrowRight size={20} />
          </Link>
          <Link to="/signup" className="btn btn-outline">
            Get Started
          </Link>
        </div>
      </header>

      <section style={{ paddingBottom: '6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem' }}>Recent Articles</h2>
          <Link to="/articles" style={{ color: 'var(--primary)', fontWeight: 600 }}>See All &rarr;</Link>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {articles.map(article => (
              <Link key={article._id} to={`/articles/${article._id}`} className="glass-card" style={{ padding: '2rem', transition: 'transform 0.3s' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block', marginBottom: '1rem' }}>
                  {typeof article.category === 'object' && article.category !== null ? article.category.name : article.category}
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{article.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {article.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link 
                      to={`/profile/${article.author?._id}`} 
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}
                      onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                      onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
                    >
                      By {article.author?.name}
                    </Link>
                    <FollowButton targetUserId={article.author?._id} />
                  </div>
                  <span style={{ fontWeight: 600 }}>{article.likes.length} Likes</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
