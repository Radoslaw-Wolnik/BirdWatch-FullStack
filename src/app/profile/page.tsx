// File: src/app/profile/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import UserProfile from '@/components/UserProfile';

export default function OwnProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (updatedData) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  if (loading) return <Layout><div>Loading profile...</div></Layout>;
  if (error) return <Layout><div className="text-red-500">{error}</div></Layout>;
  if (!user) return <Layout><div>User not found</div></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <UserProfile 
        user={user} 
        isOwnProfile={true} 
        onUpdateProfile={handleUpdateProfile} 
      />
    </Layout>
  );
}