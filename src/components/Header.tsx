import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="bg-green-600 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          BirdWatch
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link href="/map" className="hover:underline">Map</Link></li>
            <li><Link href="/feed" className="hover:underline">Feed</Link></li>
            {session ? (
              <>
                <li><Link href="/profile" className="hover:underline">Profile</Link></li>
                <li><button onClick={() => signOut()} className="hover:underline">Logout</button></li>
              </>
            ) : (
              <li><Link href="/login" className="hover:underline">Login</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;