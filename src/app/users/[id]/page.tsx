// File: src/app/users/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import UserProfile from '@/components/UserProfile';
import { withAuth } from '@/lib/auth';

function OtherUserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${id}`);
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
  }, [id]);

  if (loading) return <Layout><div className="text-center py-10">Loading profile...</div></Layout>;
  if (error) return <Layout><div className="text-red-500 text-center py-10">{error}</div></Layout>;
  if (!user) return <Layout><div className="text-center py-10">User not found</div></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-primary-800">{user.username}'s Profile</h1>
      <UserProfile user={user} isOwnProfile={false} />
    </Layout>
  );
}

export default withAuth(OtherUserProfile);