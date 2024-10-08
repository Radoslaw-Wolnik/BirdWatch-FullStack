// File: src/app/posts/create/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ImageUpload from '@/components/ImageUpload';
import { withAuth, useAuth } from '@/lib/auth';

function CreatePost() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    birdSpecies: '',
    description: '',
    latitude: '',
    longitude: '',
    photos: [],
    customDate: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (file) => {
    setFormData(prev => ({ ...prev, photos: [...prev.photos, file] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'photos') {
          formData.photos.forEach(photo => formDataToSend.append('photos', photo));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to create post');
      router.push('/feed');
    } catch (err) {
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-primary-800">Create a New Bird Sighting Post</h1>
      <p className="mb-4 text-gray-600">Posting as: {user.username}</p>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="birdSpecies" className="block mb-1 text-gray-700">Bird Species</label>
          <input
            type="text"
            id="birdSpecies"
            name="birdSpecies"
            value={formData.birdSpecies}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block mb-1 text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={4}
            required
          />
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="latitude" className="block mb-1 text-gray-700">Latitude</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              step="any"
              required
            />
          </div>
          <div className="flex-1">
            <label htmlFor="longitude" className="block mb-1 text-gray-700">Longitude</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              step="any"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="photos" className="block mb-1 text-gray-700">Photos</label>
          <ImageUpload onUpload={handleImageUpload} multiple={true} />
          {formData.photos.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">{formData.photos.length} image(s) selected</p>
          )}
        </div>
        <div>
          <label htmlFor="customDate" className="block mb-1 text-gray-700">Date of Sighting</label>
          <input
            type="date"
            id="customDate"
            name="customDate"
            value={formData.customDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Post...' : 'Create Post'}
        </button>
      </form>
    </Layout>
  );
}

export default withAuth(CreatePost);