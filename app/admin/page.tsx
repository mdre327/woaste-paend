import AdminEventsPanel from "@/components/admin-events-panel";
import { requireAdminPageSession } from "@/lib/admin-auth";
import { listEvents } from "@/lib/server-events";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminUser = await requireAdminPageSession();
  const events = await listEvents();

  return (
    <main className="page-shell">
      <AdminEventsPanel initialEvents={events} adminLabel={adminUser.username} />
    </main>
  );
}
