import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // All routes are publicly accessible — no auth wall
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
