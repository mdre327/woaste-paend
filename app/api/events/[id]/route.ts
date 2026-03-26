import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-auth";
import { deleteEvent, getEventById, updateEvent } from "@/lib/server-events";
import type { EventDraft } from "@/lib/events";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const event = await getEventById(id);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ event });
}

export async function PUT(request: Request, context: RouteContext) {
  const adminUser = await requireAdminRequest(request);

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const draft = (await request.json()) as EventDraft;
  const event = await updateEvent(id, draft);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ event });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const adminUser = await requireAdminRequest(_request);

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await deleteEvent(id);
  return NextResponse.json({ ok: true });
}
