// File: src/app/posts/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Layout from '@/components/Layout';
import { formatDate } from '@/lib/dateUtils';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) throw new Error('Failed to fetch post');
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError('Failed to load post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to like post');
      const updatedPost = await response.json();
      setPost(updatedPost);
    } catch (err) {
      setError('Failed to like post. Please try again.');
    }
  };

  const handleFlag = async () => {
    try {
      const reason = prompt('Please provide a reason for flagging this post:');
      if (!reason) return;
      const response = await fetch(`/api/posts/${id}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to flag post');
      alert('Post has been flagged for review.');
    } catch (err) {
      setError('Failed to flag post. Please try again.');
    }
  };

  if (loading) return <Layout><div>Loading post...</div></Layout>;
  if (error) return <Layout><div className="text-red-500">{error}</div></Layout>;
  if (!post) return <Layout><div>Post not found</div></Layout>;

  return (
    <Layout>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{post.birdSpecies.join(', ')}</h1>
        <p className="text-gray-600 mb-4">Posted by {post.user.username} on {formatDate(post.createdAt)}</p>
        <p className="mb-4">{post.description}</p>
        <div className="mb-4">
          <p>Latitude: {post.latitude}</p>
          <p>Longitude: {post.longitude}</p>
        </div>
        {post.photos && post.photos.length > 0 && (
          <div className="mb-4">
            {post.photos.map((photo, index) => (
              <Image 
                key={index} 
                src={photo} 
                alt={`Bird sighting ${index + 1}`} 
                width={300} 
                height={200} 
                className="mb-2"
              />
            ))}
          </div>
        )}
        <div className="flex space-x-4">
          <button onClick={handleLike} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Like ({post.likes.length})
          </button>
          <button onClick={handleFlag} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
            Flag Post
          </button>
        </div>
      </div>
    </Layout>
  );
}