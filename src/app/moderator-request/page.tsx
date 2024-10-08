// File: src/app/moderator-request/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

export default function ModeratorRequest() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    description: '',
    qualifications: '',
    location: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/moderator-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Failed to submit moderator request');
      router.push('/profile');
    } catch (err) {
      setError('Failed to submit moderator request. Please try again.');
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Request to Become a Moderator</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block mb-1">Why do you want to be a moderator?</label>
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
          <label htmlFor="qualifications" className="block mb-1">What are your qualifications?</label>
          <textarea
            id="qualifications"
            name="qualifications"
            value={formData.qualifications}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            rows={4}
            required
          />
        </div>
        <div>
          <label htmlFor="location" className="block mb-1">Your Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Submit Request
        </button>
      </form>
    </Layout>
  );
}