// File: src/app/page.tsx

import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to BirdWatch</h1>
        <p className="text-xl mb-8">
          Join our community of bird enthusiasts and share your sightings!
        </p>
        <div className="space-x-4">
          <Link href="/register" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            Sign Up
          </Link>
          <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Log In
          </Link>
        </div>
      </div>
    </Layout>
  );
}