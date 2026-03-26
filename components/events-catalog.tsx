import Link from "next/link";
import type { CSSProperties } from "react";
import {
  buildCalendarIcs,
  createGoogleCalendarLink,
  formatEventDateRange,
  type EventItem,
} from "@/lib/events";

type EventsCatalogProps = {
  events: EventItem[];
};

export default function EventsCatalog({ events }: EventsCatalogProps) {

  return (
    <section className="route-shell">
      <section className="page-hero">
        <p className="eyebrow">Events</p>
        <h1>All Woategi gatherings in one place.</h1>
        <p className="page-hero-copy">
          Browse every tasting, market, and chai night. Add upcoming sessions to
          your calendar and keep the next pour on schedule.
        </p>
        <div className="page-hero-stats">
          <article className="stat-card">
            <span>{events.length}</span>
            <p>Total event formats currently listed in the house calendar</p>
          </article>
          <article className="stat-card">
            <span>{events.length}</span>
            <p>Calendar-ready sessions available to save into your schedule</p>
          </article>
        </div>
      </section>

      <section className="events-list">
        {events.map((event) => (
          <article
            key={event.id}
            className="event-card"
            style={{ "--card-accent": event.accent } as CSSProperties}
          >
            <div className="event-card-main">
              <div className="menu-card-topline">
                <span>{event.host}</span>
                <strong>{event.capacity} seats</strong>
              </div>
              <h2>
                <Link href={`/events/${event.id}`} className="event-card-link">
                  {event.title}
                </Link>
              </h2>
              <p>{event.description}</p>
              <dl className="event-card-meta">
                <div>
                  <dt>Date</dt>
                  <dd>{formatEventDateRange(event.startDate, event.endDate)}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{event.location}</dd>
                </div>
              </dl>
            </div>

            <div className="event-card-actions">
              <a
                href={createGoogleCalendarLink(event)}
                className="primary-action"
                target="_blank"
                rel="noreferrer"
              >
                Add to Google Calendar
              </a>
              <a
                href={`data:text/calendar;charset=utf-8,${encodeURIComponent(
                  buildCalendarIcs(event),
                )}`}
                download={`${event.id}.ics`}
                className="secondary-action event-action-button"
              >
                Download .ics
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="page-cta-strip">
        <p>Need to publish a new gathering?</p>
        <Link href="/admin" className="secondary-action">
          Open admin panel
        </Link>
      </section>
    </section>
  );
}
