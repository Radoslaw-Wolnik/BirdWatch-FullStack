// File: src/app/profile/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import UserProfile from '@/components/UserProfile';
import { withAuth } from '@/lib/auth';
import ImageUpload from '@/components/ImageUpload';

function OwnProfile() {
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

  const handleProfilePictureUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to upload profile picture');
      const { profilePictureUrl } = await response.json();
      setUser(prevUser => ({ ...prevUser, profilePicture: profilePictureUrl }));
    } catch (err) {
      setError('Failed to upload profile picture. Please try again.');
    }
  };

  if (loading) return <Layout><div className="text-center py-10">Loading profile...</div></Layout>;
  if (error) return <Layout><div className="text-red-500 text-center py-10">{error}</div></Layout>;
  if (!user) return <Layout><div className="text-center py-10">User not found</div></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-primary-800">Your Profile</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-secondary-700">Update Profile Picture</h2>
        <ImageUpload onUpload={handleProfilePictureUpload} />
      </div>
      <UserProfile user={user} isOwnProfile={true} onUpdateProfile={handleUpdateProfile} />
    </Layout>
  );
}

export default withAuth(OwnProfile);