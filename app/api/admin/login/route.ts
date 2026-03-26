import { NextResponse } from "next/server";
import { createAdminSession, getAdminSessionCookie } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTarget = new URL("/admin/login", request.url);

  if (!identifier || !password) {
    redirectTarget.searchParams.set("error", "missing");
    return NextResponse.redirect(redirectTarget, { status: 303 });
  }

  const session = await createAdminSession(identifier, password);

  if (!session) {
    redirectTarget.searchParams.set("error", "invalid");
    return NextResponse.redirect(redirectTarget, { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), {
    status: 303,
  });

  response.cookies.set(getAdminSessionCookie(session.token));

  return response;
}
