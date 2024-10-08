// File: src/app/feed/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import BirdPostCard from '@/components/BirdPostCard';

export default function Feed() {
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

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div className="text-red-500">{error}</div></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Your Feed</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <BirdPostCard key={post.id} post={post} />
        ))}
      </div>
    </Layout>
  );
}