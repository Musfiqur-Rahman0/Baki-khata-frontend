import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has("access_token") || request.cookies.has("refresh_token");

  if (!hasSession) {
    const authUrl = new URL("/auth", request.url);
    authUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/onbording/:path*", "/store/:path*"],
};
