// File: src/app/page.tsx

import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="text-center py-20">
        <h1 className="text-5xl font-bold mb-8 text-primary-800">Welcome to BirdWatch</h1>
        <p className="text-2xl mb-12 text-gray-600">
          Join our community of bird enthusiasts and share your sightings!
        </p>
        <div className="space-x-4">
          <Link href="/register" className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
            Sign Up
          </Link>
          <Link href="/login" className="bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
            Log In
          </Link>
        </div>
      </div>
    </Layout>
  );
}