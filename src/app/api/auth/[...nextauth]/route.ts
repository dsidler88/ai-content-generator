//the ...nextauth syntax means that ANYTHING that includes /api/auth will go through this route and be handled by Next Auth
import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions);
export { handler as GET, handler as Post };
