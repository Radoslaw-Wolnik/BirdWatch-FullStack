import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';
import { SafeUser, UserRole } from '../types/global';

export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return;
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
  return { 
    user: session?.user as SafeUser | undefined, 
    isLoading: status === 'loading', 
    isAuthenticated: !!session 
  };
}

export function withRole<P extends object>(Component: ComponentType<P>, allowedRoles: UserRole[]) {
  return function RoleProtectedComponent(props: P) {
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