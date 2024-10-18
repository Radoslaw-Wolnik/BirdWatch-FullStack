import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { LoginCredentials, SafeUser, UserRole, SessionUser, PublicUser } from "@/types/global";
import { UnauthorizedError } from "@/lib/errors";

declare module "next-auth" {
  interface User {
    id: number;
    username: string;
    role: UserRole;
  }
  
  interface Session {
    user: SessionUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: UserRole;
    username: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new UnauthorizedError("No credentials provided");
        }
        const { email, password } = credentials as LoginCredentials;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
          throw new UnauthorizedError("Invalid credentials");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new UnauthorizedError("Invalid credentials");
        }
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id);
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        role: token.role,
        username: token.username,
      } as SessionUser;
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// its a good practice to make this function:
// export async function authenticateUser(username: string, password: string): Promise<AuthUser> { ... }

export async function getUserById(id: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) }
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role as UserRole,
    profilePicture: user.profilePicture,
  };
}