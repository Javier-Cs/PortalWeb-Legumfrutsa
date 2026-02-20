// src/pages/api/auth/[...auth].ts
export const prerender = false;
export const ssr = true;

import type { APIRoute } from "astro";
import { Auth } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "../../../lib/prisma";

const authConfig = {
  basePath: "/api/auth",
  trustHost: true,
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.usuarios.findFirst({
          where: {
            email: credentials.email,
            estado: true,
          },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.pass
        );

        if (!isValid) return null;

        return {
          id: user.id_user.toString(),
          email: user.email,
          name: user.nombre,
          rol: user.rol,
          id_empresa: user.id_empresa,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol = user.rol;
        token.id_empresa = user.id_empresa;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.rol = token.rol;
      session.user.id_empresa = token.id_empresa;
      return session;
    },
  },

  pages: {
    signIn: "/",
  },
};

export const GET: APIRoute = ({ request }) =>
  Auth(request, authConfig);

export const POST: APIRoute = ({ request }) =>
  Auth(request, authConfig);

declare module "@auth/core/jwt" {
  interface JWT {
    rol: string;
    id_empresa: number;
  }
}
