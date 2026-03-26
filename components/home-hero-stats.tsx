"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { EventItem } from "@/lib/events";
import type { TestimonialItem } from "@/lib/testimonials";
import { formatEventDateRange } from "@/lib/events";
import styles from "@/components/home-hero-stats.module.css";

type HomeHeroStatsProps = {
  events: EventItem[];
  testimonials: TestimonialItem[];
};

export default function HomeHeroStats({
  events,
  testimonials,
}: HomeHeroStatsProps) {
  const [eventIndex, setEventIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    if (events.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setEventIndex((current) => (current + 1) % events.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [events.length]);

  useEffect(() => {
    if (testimonials.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setTestimonialIndex((current) => (current + 1) % testimonials.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [testimonials.length]);

  const currentEvent = events[eventIndex] ?? null;
  const currentTestimonial = testimonials[testimonialIndex] ?? null;
  const visibleEventDots = events.slice(0, 4);
  const activeEventDotIndex =
    eventIndex >= visibleEventDots.length
      ? Math.max(visibleEventDots.length - 1, 0)
      : eventIndex;

  return (
    <div className="hero-stats" aria-label="Shop highlights">
      <article
        className="hero-carousel-card hero-events-card"
        style={
          currentEvent
            ? ({ "--hero-accent": currentEvent.accent } as CSSProperties)
            : undefined
        }
      >
        <div className="hero-card-topline">
          <span>Current Events</span>
          <small>{events.length} live formats</small>
        </div>
        {currentEvent ? (
          <>
            <Link
              href={`/events/${currentEvent.id}`}
              className="hero-event-link"
            >
              <h3>{currentEvent.title}</h3>
              <p>{currentEvent.summary}</p>
              <div className="hero-carousel-meta">
                <strong>
                  {formatEventDateRange(
                    currentEvent.startDate,
                    currentEvent.endDate,
                  )}
                </strong>
                <small>{currentEvent.location}</small>
              </div>
            </Link>
          </>
        ) : (
          <p>No event is published yet.</p>
        )}
        <div className={styles.dotRow} aria-label="Event carousel status">
          {visibleEventDots.map((event, index) => (
            <button
              key={event.id}
              type="button"
              className={`${styles.dotButton} ${
                index === activeEventDotIndex ? styles.dotButtonActive : ""
              }`}
              aria-label={`Show ${event.title}`}
              onClick={() => setEventIndex(index)}
            />
          ))}
          {events.length > 4 ? (
            <Link href="/events" className={styles.moreLink}>
              +more events
            </Link>
          ) : null}
        </div>
      </article>

      <article className="hero-metric-card">
        <span className="hero-metric-label">Total Tea Sold</span>
        <strong>24,800+</strong>
        <p>Total cups served across house pours, tasting flights, and Woategi formats.</p>
      </article>

      <article
        className="hero-carousel-card hero-testimonial-card"
        style={
          currentTestimonial
            ? ({ "--hero-accent": currentTestimonial.accent } as CSSProperties)
            : undefined
        }
      >
        <div className="hero-card-topline">
          <span>Testimonies</span>
          <small>312 collected voices</small>
        </div>
        {currentTestimonial ? (
          <>
            <blockquote>{currentTestimonial.quote}</blockquote>
            <div className="hero-carousel-meta">
              <strong>{currentTestimonial.author}</strong>
              <small>{currentTestimonial.role}</small>
            </div>
          </>
        ) : (
          <p>No testimonies published yet.</p>
        )}
        <div className={styles.dotRow} aria-hidden="true">
          {testimonials.map((item, index) => (
            <span
              key={item.id}
              className={`${styles.dotStatic} ${
                index === testimonialIndex ? styles.dotStaticActive : ""
              }`}
            />
          ))}
        </div>
      </article>
    </div>
  );
}
