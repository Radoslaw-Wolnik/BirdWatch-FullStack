// File: src/app/map/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '@/components/Layout';
import { withAuth } from '@/lib/auth';

function Map() {
  const [birdSightings, setBirdSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBirdSightings = async () => {
      try {
        const response = await fetch('/api/posts/map?lat=0&lon=0&radius=1000');
        if (!response.ok) throw new Error('Failed to fetch bird sightings');
        const data = await response.json();
        setBirdSightings(data);
      } catch (err) {
        setError('Failed to load bird sightings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBirdSightings();
  }, []);

  if (loading) return <Layout><div className="text-center py-10">Loading map...</div></Layout>;
  if (error) return <Layout><div className="text-red-500 text-center py-10">{error}</div></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-primary-800">Bird Sightings Map</h1>
      <div className="h-[600px] w-full border border-gray-300 rounded-lg overflow-hidden">
        <MapContainer center={[0, 0]} zoom={3} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {birdSightings.map((sighting) => (
            <Marker key={sighting.id} position={[sighting.latitude, sighting.longitude]}>
              <Popup>
                <div>
                  <h3 className="font-bold text-primary-700">{sighting.birdSpecies.join(', ')}</h3>
                  <p className="text-gray-600">{sighting.description}</p>
                  <p className="text-sm text-gray-500">Posted on: {new Date(sighting.createdAt).toLocaleDateString()}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Layout>
  );
}

export default withAuth(Map);