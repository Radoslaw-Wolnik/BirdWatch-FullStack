// File: src/components/Header.tsx

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">BirdWatch</Link>
        <nav>
          <ul className="flex space-x-4">
            {session ? (
              <>
                <li><Link href="/feed" className="hover:text-primary-200">Feed</Link></li>
                <li><Link href="/map" className="hover:text-primary-200">Map</Link></li>
                <li><Link href="/posts/create" className="hover:text-primary-200">New Post</Link></li>
                <li><Link href="/friends" className="hover:text-primary-200">Friends</Link></li>
                <li><Link href="/profile" className="hover:text-primary-200">Profile</Link></li>
                {session.user.role === 'MODERATOR' && (
                  <li><Link href="/moderation" className="hover:text-primary-200">Moderate</Link></li>
                )}
                {session.user.role === 'ADMIN' && (
                  <li><Link href="/admin/dashboard" className="hover:text-primary-200">Admin</Link></li>
                )}
                <li><button onClick={() => signOut()} className="hover:text-primary-200">Logout</button></li>
              </>
            ) : (
              <>
                <li><Link href="/login" className="hover:text-primary-200">Login</Link></li>
                <li><Link href="/register" className="hover:text-primary-200">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;