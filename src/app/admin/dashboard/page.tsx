// File: src/app/admin/dashboard/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

export default function AdminDashboard() {
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [moderatorRequests, setModeratorRequests] = useState([]);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [inactiveUsersRes, moderatorRequestsRes, flaggedPostsRes] = await Promise.all([
          fetch('/api/admin?action=inactiveUsers'),
          fetch('/api/admin?action=moderatorRequests'),
          fetch('/api/admin?action=flaggedPosts')
        ]);

        if (!inactiveUsersRes.ok || !moderatorRequestsRes.ok || !flaggedPostsRes.ok) {
          throw new Error('Failed to fetch admin data');
        }

        const [inactiveUsersData, moderatorRequestsData, flaggedPostsData] = await Promise.all([
          inactiveUsersRes.json(),
          moderatorRequestsRes.json(),
          flaggedPostsRes.json()
        ]);

        setInactiveUsers(inactiveUsersData);
        setModeratorRequests(moderatorRequestsData);
        setFlaggedPosts(flaggedPostsData);
      } catch (err) {
        setError('Failed to load admin data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteUser', id: userId })
      });
      if (!response.ok) throw new Error('Failed to delete user');
      setInactiveUsers(inactiveUsers.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleModeratorRequest = async (requestId, action) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action === 'approve' ? 'approveModerator' : 'rejectModerator', id: requestId })
      });
      if (!response.ok) throw new Error(`Failed to ${action} moderator request`);
      setModeratorRequests(moderatorRequests.filter(request => request.id !== requestId));
    } catch (err) {
      setError(`Failed to ${action} moderator request. Please try again.`);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deletePost', id: postId })
      });
      if (!response.ok) throw new Error('Failed to delete post');
      setFlaggedPosts(flaggedPosts.filter(post => post.id !== postId));
    } catch (err) {
      setError('Failed to delete post. Please try again.');
    }
  };

  if (loading) return <Layout><div>Loading admin data...</div></Layout>;
  if (error) return <Layout><div className="text-red-500">{error}</div></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Inactive Users</h2>
        <ul className="space-y-2">
          {inactiveUsers.map(user => (
            <li key={user.id} className="flex justify-between items-center">
              <span>{user.username} - Last active: {new Date(user.lastActive).toLocaleDateString()}</span>
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Delete User
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Moderator Requests</h2>
        <ul className="space-y-4">
          {moderatorRequests.map(request => (
            <li key={request.id} className="bg-white shadow-md rounded-lg p-4">
              <p><strong>User:</strong> {request.user.username}</p>
              <p><strong>Description:</strong> {request.description}</p>
              <p><strong>Qualifications:</strong> {request.qualifications}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleModeratorRequest(request.id, 'approve')}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleModeratorRequest(request.id, 'reject')}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Flagged Posts</h2>
        <ul className="space-y-4">
          {flaggedPosts.map(post => (
            <li key={post.id} className="bg-white shadow-md rounded-lg p-4">
              <p><strong>Bird Species:</strong> {post.post.birdSpecies.join(', ')}</p>
              <p><strong>Description:</strong> {post.post.description}</p>
              <p><strong>Flagged by:</strong> {post.user.username}</p>
              <p><strong>Reason:</strong> {post.reason}</p>
              <button
                onClick={() => handleDeletePost(post.post.id)}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Delete Post
              </button>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}