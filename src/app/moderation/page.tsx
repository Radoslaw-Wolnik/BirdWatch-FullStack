// File: src/app/moderation/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { withRole } from '@/lib/auth';

function Moderation() {
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
      setFlaggedPosts(flaggedPosts.filter(post => post.id !== postId));
    } catch (err) {
      setError('Failed to moderate post. Please try again.');
    }
  };

  if (loading) return <Layout><div className="text-center py-10">Loading moderation data...</div></Layout>;
  if (error) return <Layout><div className="text-red-500 text-center py-10">{error}</div></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-primary-800">Moderation Dashboard</h1>
      {flaggedPosts.length === 0 ? (
        <p className="text-gray-600 text-center py-10">No flagged posts to review.</p>
      ) : (
        <ul className="space-y-6">
          {flaggedPosts.map((post) => (
            <li key={post.id} className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-secondary-700">{post.post.birdSpecies.join(', ')}</h3>
              <p className="mb-2 text-gray-600">{post.post.description}</p>
              <p className="text-sm text-gray-500 mb-2">Posted by: {post.post.user.username}</p>
              <p className="text-sm text-gray-500 mb-4">Flagged reason: {post.reason}</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleModeratePost(post.id, 'RESOLVE')}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                >
                  Remove Post
                </button>
                <button
                  onClick={() => handleModeratePost(post.id, 'DISMISS')}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
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

export default withRole(Moderation, ['MODERATOR', 'ADMIN']);