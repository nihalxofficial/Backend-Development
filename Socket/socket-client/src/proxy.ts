import { NextResponse } from "next/server";
import { auth } from "./lib/auth";
import { headers } from "next/headers";
import type { NextRequest } from 'next/server'

export async function proxy(request:NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;
  const pathname = request.nextUrl.pathname;

  // If logged in, redirect away from login/signup
  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If not logged in, redirect away from protected routes
  // if (!user && (pathname.startsWith("/dashboard") || pathname.startsWith("/all-pets/"))) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  // If not logged in, redirect to login with callbackUrl
  if (!user && (pathname.startsWith("/add-student") || (pathname.startsWith("/dashboard") || pathname.match(/^\/students\/.+/)))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
}

  return NextResponse.next();
}

export const config = {
    matcher: ["/students/:id+","/add-student", "/dashboard/:path*", "/login", "/signup"],
};