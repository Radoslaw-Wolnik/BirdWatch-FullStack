import React from 'react';
import Image from 'next/image';
import { formatDate } from '@/lib/dateUtils';

const BirdPostCard = ({ post }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {post.photos && post.photos.length > 0 && (
        <div className="relative h-48">
          <Image
            src={post.photos[0]}
            alt={post.birdSpecies[0]}
            layout="fill"
            objectFit="cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{post.birdSpecies.join(', ')}</h3>
        <p className="text-gray-600 mb-2">{post.description}</p>
        <p className="text-sm text-gray-500">Posted by {post.user.username} on {formatDate(post.createdAt)}</p>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button className="text-blue-500 hover:text-blue-600">Like ({post.likes.length})</button>
            <button className="text-red-500 hover:text-red-600">Dislike ({post.dislikes.length})</button>
          </div>
          <button className="text-gray-500 hover:text-gray-600">Flag</button>
        </div>
      </div>
    </div>
  );
};

export default BirdPostCard;