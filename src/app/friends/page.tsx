// File: src/app/friends/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { withAuth } from '@/lib/auth';

function Friends() {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFriendsAndRequests = async () => {
      try {
        const [friendsResponse, requestsResponse] = await Promise.all([
          fetch('/api/friends'),
          fetch('/api/friends?status=pending')
        ]);

        if (!friendsResponse.ok || !requestsResponse.ok) throw new Error('Failed to fetch data');

        const [friendsData, requestsData] = await Promise.all([
          friendsResponse.json(),
          requestsResponse.json()
        ]);

        setFriends(friendsData);
        setFriendRequests(requestsData);
      } catch (err) {
        setError('Failed to load friends data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsAndRequests();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/users/search?q=${searchTerm}`);
      if (!response.ok) throw new Error('Failed to search users');
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError('Failed to search users. Please try again.');
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: userId })
      });
      if (!response.ok) throw new Error('Failed to send friend request');
      // Update UI to reflect sent request
    } catch (err) {
      setError('Failed to send friend request. Please try again.');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/friends/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACCEPT' })
      });
      if (!response.ok) throw new Error('Failed to accept friend request');
      // Update UI to reflect accepted request
    } catch (err) {
      setError('Failed to accept friend request. Please try again.');
    }
  };

  if (loading) return <Layout><div className="text-center py-10">Loading friends data...</div></Layout>;
  if (error) return <Layout><div className="text-red-500 text-center py-10">{error}</div></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-primary-800">Friends</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-secondary-700">Search Users</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search by username"
          />
          <button onClick={handleSearch} className="bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
            Search
          </button>
        </div>
        {searchResults.length > 0 && (
          <ul className="mt-4 space-y-2">
            {searchResults.map((user) => (
              <li key={user.id} className="flex justify-between items-center bg-white p-3 rounded-md shadow">
                <span>{user.username}</span>
                <button onClick={() => handleSendRequest(user.id)} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-1 px-3 rounded-md text-sm transition duration-300">
                  Add Friend
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-secondary-700">Friend Requests</h2>
        {friendRequests.length === 0 ? (
          <p className="text-gray-600">No pending friend requests.</p>
        ) : (
          <ul className="space-y-2">
            {friendRequests.map((request) => (
              <li key={request.id} className="flex justify-between items-center bg-white p-3 rounded-md shadow">
                <span>{request.user.username}</span>
                <button onClick={() => handleAcceptRequest(request.id)} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-1 px-3 rounded-md text-sm transition duration-300">
                  Accept
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-secondary-700">Your Friends</h2>
        {friends.length === 0 ? (
          <p className="text-gray-600">You haven't added any friends yet.</p>
        ) : (
          <ul className="space-y-2">
            {friends.map((friend) => (
              <li key={friend.id} className="flex justify-between items-center bg-white p-3 rounded-md shadow">
                <span>{friend.username}</span>
                <button className="bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-1 px-3 rounded-md text-sm transition duration-300">
                  View Profile
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}

export default withAuth(Friends);