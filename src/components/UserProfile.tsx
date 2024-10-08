// File: src/components/UserProfile.tsx

import React, { useState } from 'react';
import Image from 'next/image';
import BirdPostCard from './BirdPostCard';

interface User {
  id: number;
  username: string;
  email: string;
  profilePicture: string;
  createdAt: string;
  role: string;
  posts: any[]; // Replace 'any' with a proper Post type if available
  _count: {
    posts: number;
    friends: number;
  };
}

interface UserProfileProps {
  user: User;
  isOwnProfile: boolean;
  onUpdateProfile?: (updatedData: Partial<User>) => Promise<void>;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, isOwnProfile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (onUpdateProfile) {
      await onUpdateProfile(editedUser);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center mb-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden mr-4">
          <Image
            src={user.profilePicture || '/default-avatar.png'}
            alt={user.username}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div>
          {isEditing ? (
            <input
              type="text"
              name="username"
              value={editedUser.username}
              onChange={handleChange}
              className="text-2xl font-bold mb-1 border rounded px-2 py-1"
            />
          ) : (
            <h2 className="text-2xl font-bold mb-1">{user.username}</h2>
          )}
          <p className="text-gray-600">Member since {new Date(user.createdAt).getFullYear()}</p>
          <p className="text-gray-600 capitalize">{user.role.toLowerCase()}</p>
        </div>
      </div>
      {isOwnProfile && (
        <div className="mb-4">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2">
                Save
              </button>
              <button onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={handleEdit} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Edit Profile
            </button>
          )}
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Stats</h3>
        <p>Posts: {user._count.posts}</p>
        <p>Friends: {user._count.friends}</p>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Recent Posts</h3>
        <div className="space-y-4">
          {user.posts.map(post => (
            <BirdPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;