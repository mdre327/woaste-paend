import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { formatEventDateRange } from "@/lib/events";
import { getEventById, listPreviousEventsInSeries } from "@/lib/server-events";

type EventPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const previousEvents = await listPreviousEventsInSeries(
    event.seriesId,
    event.id,
    event.startDate,
  );

  return (
    <main className="page-shell route-shell">
      <section className="event-detail-hero">
        {previousEvents.length === 0 ? (
          <div className="fresh-event-ribbon">Fresh Event</div>
        ) : null}

        <div className="event-detail-copy">
          <p className="eyebrow">Event detail</p>
          <h1>{event.title}</h1>
          <p className="page-hero-copy">{event.description}</p>
          <dl className="event-card-meta">
            <div>
              <dt>Date</dt>
              <dd>{formatEventDateRange(event.startDate, event.endDate)}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{event.location}</dd>
            </div>
            <div>
              <dt>Host</dt>
              <dd>{event.host}</dd>
            </div>
          </dl>
        </div>

        <div className="event-detail-cover">
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="event-detail-image"
            sizes="(max-width: 1080px) 100vw, 40vw"
          />
        </div>
      </section>

      <section className="event-gallery-section">
        <div className="section-heading">
          <p className="eyebrow">Pictures</p>
          <h2>Visual moments from the format.</h2>
        </div>

        <div className="event-gallery-grid">
          {event.galleryImages.map((image, index) => (
            <div key={image} className="event-gallery-card">
              <Image
                src={image}
                alt={`${event.title} gallery ${index + 1}`}
                fill
                className="event-detail-image"
                sizes="(max-width: 1080px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="event-history-section">
        <div className="section-heading">
          <p className="eyebrow">Previous same events</p>
          <h2>Earlier editions of this format.</h2>
        </div>

        {previousEvents.length === 0 ? (
          <article className="info-card">
            <p className="eyebrow">Fresh event</p>
            <h2>No previous edition yet.</h2>
            <p>
              This is the first published version of this event series, so the
              page is showing the Fresh Event ribbon instead of an archive list.
            </p>
          </article>
        ) : (
          <div className="event-history-grid">
            {previousEvents.map((previousEvent) => (
              <Link
                key={previousEvent.id}
                href={`/events/${previousEvent.id}`}
                className="catalog-card"
                style={{ "--card-accent": previousEvent.accent } as CSSProperties}
              >
                <div className="menu-card-topline">
                  <span>{previousEvent.host}</span>
                  <strong>{previousEvent.capacity} seats</strong>
                </div>
                <h3>{previousEvent.title}</h3>
                <p>{previousEvent.summary}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
