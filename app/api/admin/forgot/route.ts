import { NextResponse } from "next/server";
import { createPasswordResetRequest } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const identifier = String(formData.get("identifier") ?? "").trim();
  const redirectTarget = new URL("/admin/forgot", request.url);

  if (!identifier) {
    redirectTarget.searchParams.set("error", "missing");
    return NextResponse.redirect(redirectTarget, { status: 303 });
  }

  const resetRequest = await createPasswordResetRequest(identifier);
  redirectTarget.searchParams.set("sent", "1");

  if (resetRequest) {
    redirectTarget.searchParams.set("token", resetRequest.token);
  }

  return NextResponse.redirect(redirectTarget, { status: 303 });
}
