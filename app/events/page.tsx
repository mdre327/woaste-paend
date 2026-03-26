import EventsCatalog from "@/components/events-catalog";
import { listEvents } from "@/lib/server-events";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await listEvents();

  return (
    <main className="page-shell">
      <EventsCatalog events={events} />
    </main>
  );
}
