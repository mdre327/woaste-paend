import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-auth";
import { createEvent, listEvents } from "@/lib/server-events";
import type { EventDraft } from "@/lib/events";

export async function GET() {
  const events = await listEvents();
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const adminUser = await requireAdminRequest(request);

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const draft = (await request.json()) as EventDraft;
  const event = await createEvent(draft);
  return NextResponse.json({ event }, { status: 201 });
}
