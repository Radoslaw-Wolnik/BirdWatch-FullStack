import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// Ensure a singleton instance of PrismaClient
let prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt", // Using JWT strategy for sessions
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // Add custom field 'role' to token
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role; // Pass 'role' to session
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

// Export handler for GET and POST methods
export { handler as GET, handler as POST };
