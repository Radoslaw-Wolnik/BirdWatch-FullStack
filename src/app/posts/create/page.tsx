// File: src/app/posts/create/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

export default function CreatePost() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    birdSpecies: '',
    description: '',
    latitude: '',
    longitude: '',
    photos: [],
    customDate: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    // Handle photo upload logic here
    // This is a placeholder and should be replaced with actual file upload logic
    console.log('Photo upload:', e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Failed to create post');
      router.push('/feed');
    } catch (err) {
      setError('Failed to create post. Please try again.');
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Create a New Bird Sighting Post</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="birdSpecies" className="block mb-1">Bird Species</label>
          <input
            type="text"
            id="birdSpecies"
            name="birdSpecies"
            value={formData.birdSpecies}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            rows={4}
            required
          />
        </div>
        <div>
          <label htmlFor="latitude" className="block mb-1">Latitude</label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            step="any"
            required
          />
        </div>
        <div>
          <label htmlFor="longitude" className="block mb-1">Longitude</label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            step="any"
            required
          />
        </div>
        <div>
          <label htmlFor="photos" className="block mb-1">Photos</label>
          <input
            type="file"
            id="photos"
            name="photos"
            onChange={handlePhotoUpload}
            className="w-full px-3 py-2 border rounded"
            multiple
            accept="image/*"
          />
        </div>
        <div>
          <label htmlFor="customDate" className="block mb-1">Date of Sighting</label>
          <input
            type="date"
            id="customDate"
            name="customDate"
            value={formData.customDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Create Post
        </button>
      </form>
    </Layout>
  );
}