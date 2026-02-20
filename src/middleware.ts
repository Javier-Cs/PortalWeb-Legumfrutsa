// src/middleware.ts
import { defineMiddleware } from "astro/middleware";
import { jwtVerify } from "jose";

const protectedRoutes = [
  "/dashboard",
  "/settings",
  "/productos",
  "/usuarios"
];

const adminRoutes = [
  "/productos_crud",
  "/usuarios",
];

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;

  // 1️⃣ Rutas públicas
  if (
    pathname === "/" ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/_astro") ||
    pathname.startsWith("/favicon")
  ) {
    return next();
  }

  // 2️⃣ Rutas no protegidas
  if (!protectedRoutes.some((r) => pathname.startsWith(r))) {
    return next();
  }

  // 3️⃣ Leer JWT manual
  const token = ctx.cookies.get("session-token")?.value;

  if (!token) {
    return ctx.redirect("/");
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.AUTH_SECRET!)
    );

    const { rol, id_empresa, email, sub } = payload as any;

    // 4️⃣ Solo admin
    if (adminRoutes.some((r) => pathname.startsWith(r)) && rol !== "ADMIN") {
      return new Response("Forbidden - acceso denegado", { status: 403 });
    }

    // 5️⃣ Usuario disponible en Astro.locals
    ctx.locals.user = {
      sub,
      email,
      rol,
      id_empresa,
    };

    return next();
  } catch {
    return ctx.redirect("/");
  }
});