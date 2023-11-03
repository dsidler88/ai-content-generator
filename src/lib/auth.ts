import { NextAuthOptions, DefaultSession, getServerSession } from "next-auth";
import { prisma } from "./db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";

//actually making a module that extends the next-auth module
//so we can have custom types like credits
declare module "next-auth" {
  //can't just declare id and credits, that overwrites "user". must join it with the current user type
  interface Session extends DefaultSession {
    user: {
      id: string;
      credits: number;
      //stated that "the default session will index into the user object"
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    credits: number;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    //jwt callback runs when a jwt is created. token contains info like email that is needed to create/verify a jwt
    jwt: async ({ token }) => {
      const db_user = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      });
      //Bind the db id and the credits to the token.
      //so NOW the token will have email and credits associated with it.
      if (db_user) {
        token.id = db_user.id;
        token.credits = db_user.credits;
      }
      return token;
    },
    //token props comesfrom google auth, we did the same in the RClone app
    session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.credits = token.credits;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET as string,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
};

export const getAuthSession = () => {
  return getServerSession(authOptions);
};

//copied and pasted

// import { DefaultSession, NextAuthOptions, getServerSession } from "next-auth";
// import { prisma } from "./db";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import GoogleProvider from "next-auth/providers/google";

// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id: string;
//       credits: number;
//     } & DefaultSession["user"];
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string;
//     credits: number;
//   }
// }

// export const authOptions: NextAuthOptions = {
//   session: {
//     strategy: "jwt",
//   },
//   callbacks: {
//     jwt: async ({ token }) => {
//       const db_user = await prisma.user.findFirst({
//         where: {
//           email: token.email,
//         },
//       });
//       if (db_user) {
//         token.id = db_user.id;
//         token.credits = db_user.credits;
//       }
//       return token;
//     },
//     session: ({ session, token }) => {
//       if (token) {
//         session.user.id = token.id;
//         session.user.name = token.name;
//         session.user.email = token.email;
//         session.user.image = token.picture;
//         session.user.credits = token.credits;
//       }
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET as string,
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//     }),
//   ],
// };

// //utility function that returns the session
// export const getAuthSession = () => {
//   return getServerSession(authOptions);
// };
