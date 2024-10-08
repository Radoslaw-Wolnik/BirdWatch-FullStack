// File: src/lib/auth.tsx

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return; // Do nothing while loading
      if (!session) router.push('/login');
    }, [session, status, router]);

    if (status === 'loading') {
      return <div>Loading...</div>;
    }

    return session ? <Component {...props} /> : null;
  };
}

export function useAuth() {
  const { data: session, status } = useSession();
  return { user: session?.user, isLoading: status === 'loading', isAuthenticated: !!session };
}

export function withRole(Component, allowedRoles: string[]) {
  return function RoleProtectedComponent(props) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;
      if (!user || !allowedRoles.includes(user.role)) {
        router.push('/');
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    return user && allowedRoles.includes(user.role) ? <Component {...props} /> : null;
  };
}