import { defineMiddleware } from "astro/middleware";
import { jwtVerify } from "jose";

const protectedRoutes = [
    "/dashboard",
    "/settings",
    "/productos_crud",
    "/users",
  ];

  const adminRoutes = [
    "/productos_crud",
    "/users",
  ];


  export const onRequest = defineMiddleware(async (ctx, next) => {
    const path = ctx.url.pathname;
    

    if (!protectedRoutes.some(r => path.startsWith(r))) {
      return next();
    }

  const token =
    ctx.cookies.get("authjs.session-token")?.value ??
    ctx.cookies.get("__Secure-authjs.session-token")?.value;


    if(!token){
      return ctx.redirect("/");
    }
    
    try {
      const {payload} = await jwtVerify(
          token,
          new TextEncoder().encode(process.env.AUTH_SECRET)
      );

      if(adminRoutes.some(r => path.startsWith(r)) && payload.rol !== "ADMIN"){
          return new Response("No tienes permiso para acceder a esta página", { status: 403 });
      }

      ctx.locals.user = payload;
      return next();
      
    } catch (error) {
      return ctx.redirect("/");
    }

  });
