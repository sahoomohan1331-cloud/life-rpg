export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/app/:path*",
    "/api/tasks/:path*",
    "/api/character/:path*",
    "/api/attributes/:path*",
    "/api/market/:path*",
    "/api/streaks/:path*",
    "/login",
    "/signup",
  ],
};
