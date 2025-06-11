import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "../../../../lib/db.js";
import User from "../../../../models/User.js";
import bcrypt from "bcrypt";

// ✅ Define authOptions explicitly so we can import it in getServerSession
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("No user found");

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) throw new Error("Invalid password");

        return {
          id: user._id.toString(),
          email: user.email,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.isAdmin = user.isAdmin;
      return token;
    },
    async session({ session, token }) {
      session.user.isAdmin = token.isAdmin;
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// ✅ Use authOptions in NextAuth()
const handler = NextAuth(authOptions);

// ✅ Export as required for Next.js App Router API route
export { handler as GET, handler as POST };
