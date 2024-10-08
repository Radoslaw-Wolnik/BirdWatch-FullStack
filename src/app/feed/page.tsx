// File: src/app/feed/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import BirdPostCard from '@/components/BirdPostCard';
import { withAuth } from '@/lib/auth';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/feed');
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError('Failed to load feed. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <Layout><div className="text-center py-10">Loading...</div></Layout>;
  if (error) return <Layout><div className="text-red-500 text-center py-10">{error}</div></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-primary-800">Your Feed</h1>
      {posts.length === 0 ? (
        <p className="text-gray-600 text-center py-10">No posts to display. Follow some friends to see their posts!</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <BirdPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </Layout>
  );
}

export default withAuth(Feed);