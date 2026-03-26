import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  getClearedAdminSessionCookie,
  invalidateAdminSession,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const sessionToken =
    request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE_NAME}=`))
      ?.split("=")
      .slice(1)
      .join("=") ?? null;

  await invalidateAdminSession(sessionToken ? decodeURIComponent(sessionToken) : null);

  const response = NextResponse.redirect(new URL("/admin/login?loggedOut=1", request.url), {
    status: 303,
  });
  response.cookies.set(getClearedAdminSessionCookie());

  return response;
}
