import Link from "next/link";
import type { CSSProperties } from "react";
import { formatEventDateRange, type EventItem } from "@/lib/events";

type WoategiPreviewProps = {
  events: EventItem[];
};

export default function WoategiPreview({ events }: WoategiPreviewProps) {
  const previewEvents = events.slice(0, 3);

  return (
    <section className="woategi-section" id="woategi">
      <div className="section-heading woategi-heading">
        <p className="eyebrow woategi-mark">woastegi ووستگی
          
        </p>
        <h2>Clay-fired gatherings, tasting nights, and courtyard chai events.</h2>
      </div>

      <div className="woategi-grid">
        {previewEvents.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="woategi-card"
            style={{ "--card-accent": event.accent } as CSSProperties}
          >
            <div className="menu-card-topline">
              <span>{event.host}</span>
              <strong>{event.capacity} seats</strong>
            </div>
            <h3>{event.title}</h3>
            <p>{event.summary}</p>
            <div className="woategi-meta">
              <span>{formatEventDateRange(event.startDate, event.endDate)}</span>
              <small>{event.location}</small>
            </div>
          </Link>
        ))}
      </div>

      <div className="woategi-actions">
        <Link href="/events" className="primary-action">
          View all events
        </Link>
        <Link href="/admin" className="secondary-action">
          Manage events
        </Link>
      </div>
    </section>
  );
}
