// File: src/app/moderation/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

export default function Moderation() {
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFlaggedPosts = async () => {
      try {
        const response = await fetch('/api/moderation/flagged');
        if (!response.ok) throw new Error('Failed to fetch flagged posts');
        const data = await response.json();
        setFlaggedPosts(data);
      } catch (err) {
        setError('Failed to load flagged posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlaggedPosts();
  }, []);

  const handleModeratePost = async (postId, action) => {
    try {
      const response = await fetch(`/api/moderation/flagged/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (!response.ok) throw new Error('Failed to moderate post');
      // Update UI to reflect moderated post
      setFlaggedPosts(flaggedPosts.filter(post => post.id !== postId));
    } catch (err) {
      setError('Failed to moderate post. Please try again.');
    }
  };

  if (loading) return <Layout><div>Loading moderation data...</div></Layout>;
  if (error) return <Layout><div className="text-red-500">{error}</div></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Moderation Dashboard</h1>
      {flaggedPosts.length === 0 ? (
        <p>No flagged posts to review.</p>
      ) : (
        <ul className="space-y-6">
          {flaggedPosts.map((post) => (
            <li key={post.id} className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-2">{post.post.birdSpecies.join(', ')}</h3>
              <p className="mb-2">{post.post.description}</p>
              <p className="text-sm text-gray-500 mb-2">Posted by: {post.post.user.username}</p>
              <p className="text-sm text-gray-500 mb-4">Flagged reason: {post.reason}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleModeratePost(post.id, 'RESOLVE')}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  Remove Post
                </button>
                <button
                  onClick={() => handleModeratePost(post.id, 'DISMISS')}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Dismiss Flag
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}