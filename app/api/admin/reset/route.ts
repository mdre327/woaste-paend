import { NextResponse } from "next/server";
import { resetAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const redirectTarget = new URL("/admin/reset", request.url);

  if (!token) {
    redirectTarget.searchParams.set("error", "missing-token");
    return NextResponse.redirect(redirectTarget, { status: 303 });
  }

  redirectTarget.searchParams.set("token", token);

  if (!password || password.length < 8) {
    redirectTarget.searchParams.set("error", "weak-password");
    return NextResponse.redirect(redirectTarget, { status: 303 });
  }

  if (password !== confirmPassword) {
    redirectTarget.searchParams.set("error", "mismatch");
    return NextResponse.redirect(redirectTarget, { status: 303 });
  }

  const wasReset = await resetAdminPassword(token, password);

  if (!wasReset) {
    redirectTarget.searchParams.set("error", "invalid-token");
    return NextResponse.redirect(redirectTarget, { status: 303 });
  }

  return NextResponse.redirect(new URL("/admin/login?reset=1", request.url), {
    status: 303,
  });
}
