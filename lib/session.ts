import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

type SessionData = {
  authenticated?: boolean;
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, {
    password: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
    cookieName: "ari_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  });
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.authenticated) {
    return false;
  }
  return true;
}
