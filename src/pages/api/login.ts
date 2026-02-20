import type { APIRoute } from "astro";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma";

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();

  if (!email || !password) {
    return new Response("Datos inválidos", { status: 400 });
  }

  const user = await prisma.usuarios.findFirst({
    where: { email, estado: true },
  });

  if (!user) {
    return new Response("Credenciales inválidas", { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.pass);
  if (!valid) {
    return new Response("Credenciales inválidas", { status: 401 });
  }

  const token = jwt.sign(
    {
      sub: user.id_user,
      email: user.email,
      rol: user.rol,
      id_empresa: user.id_empresa,
    },
    process.env.AUTH_SECRET!,
    { expiresIn: "1d" }
  );

  cookies.set("session-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure:import.meta.env.PROD,
  });

  return new Response(null, {
    status: 302,
    headers: { Location: "/dashboard" },
  });
};