"use client";

import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { ChaiItem } from "@/lib/chai-menu";
import KulladScene from "@/components/kullad-scene";

type ChaiExperienceProps = {
  items: ChaiItem[];
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export default function ChaiExperience({ items }: ChaiExperienceProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationTurns, setRotationTurns] = useState(0);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const frameRef = useRef<number | null>(null);
  const deferredIndex = useDeferredValue(activeIndex);
  const activeItem = items[activeIndex] ?? items[0];
  const displayItem = items[deferredIndex] ?? activeItem;

  useEffect(() => {
    if (!items.length) {
      return;
    }

    const syncFromScroll = () => {
      const rail = railRef.current;

      if (!rail) {
        return;
      }

      const viewportCenter = window.innerHeight * 0.5;
      let nextIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((item, index) => {
        if (!item) {
          return;
        }

        const rect = item.getBoundingClientRect();
        const center = rect.top + rect.height * 0.5;
        const distance = Math.abs(center - viewportCenter);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nextIndex = index;
        }
      });

      setActiveIndex((current) => {
        if (current === nextIndex) {
          return current;
        }

        return nextIndex;
      });

      const rect = rail.getBoundingClientRect();
      const totalScrollable = Math.max(rect.height - window.innerHeight * 0.65, 1);
      const travelled = viewportCenter - rect.top - window.innerHeight * 0.15;
      const progress = clamp(travelled / totalScrollable, 0, 1);

      setRotationTurns(progress * (items.length * 1.35));
    };

    const requestSync = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        syncFromScroll();
      });
    };

    syncFromScroll();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [items]);

  const scrollToIndex = (index: number) => {
    const nextItem = itemRefs.current[index];

    if (!nextItem) {
      return;
    }

    nextItem.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const moveSelection = (direction: number) => {
    if (!items.length) {
      return;
    }

    const nextIndex = (activeIndex + direction + items.length) % items.length;
    scrollToIndex(nextIndex);
  };

  const handleDirectionalMove = useEffectEvent((direction: number) => {
    moveSelection(direction);
  });

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage || items.length < 2) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        handleDirectionalMove(1);
      }

      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        handleDirectionalMove(-1);
      }
    };

    stage.addEventListener("keydown", handleKeyDown);

    return () => {
      stage.removeEventListener("keydown", handleKeyDown);
    };
  }, [items.length]);

  if (!activeItem) {
    return null;
  }

  return (
    <section
      className="experience-section"
      id="experience"
      style={
        {
          "--accent": activeItem.accent,
          "--accent-soft": `${activeItem.accent}22`,
        } as CSSProperties
      }
    >
      <div className="section-heading experience-heading">
        <p className="eyebrow">Center stage</p>
        <h2>The kullad stays centered during the signature scroll, then releases into the full menu.</h2>
      </div>

      <div className="experience-scroll-layout">
        <div className="experience-info-column">
          <article className="story-card experience-sticky-card">
            <p className="story-label">Now pouring</p>
            <h3>{displayItem.label}</h3>
            <p>{displayItem.description}</p>

            <dl className="story-metrics">
              <div>
                <dt>Best time</dt>
                <dd>{displayItem.temperature}</dd>
              </div>
              <div>
                <dt>Blend note</dt>
                <dd>{displayItem.spice}</dd>
              </div>
              <div>
                <dt>Pair with</dt>
                <dd>{displayItem.pairings[0]}</dd>
              </div>
            </dl>
          </article>

          <aside className="detail-card experience-sticky-card" aria-live="polite">
            <p className="story-label">Tasting line</p>
            <h3>{activeItem.mood}</h3>
            <p>{activeItem.description}</p>

            <ul className="detail-list">
              {activeItem.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>

            <div className="price-row">
              <span>{activeItem.price}</span>
              <small>{activeItem.pairings.join(" / ")}</small>
            </div>
          </aside>
        </div>

        <div className="experience-stage-column">
          <div className="stage-card experience-stage-sticky">
            <div
              ref={stageRef}
              className="kullad-stage"
              tabIndex={0}
              aria-label="Scroll-responsive interactive kullad selector"
            >
              <div className="current-signature-banner" aria-live="polite">
                <span className="current-signature-label">Current Signature</span>
                <strong>{displayItem.label}</strong>
              </div>

              <div className="kullad-motion">
                <div className="kullad-world">
                  <KulladScene turns={rotationTurns} />
                </div>
              </div>

              <div className="steam-column" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>

        <div ref={railRef} className="signature-rail" id="menu">
          <div className="section-heading signature-heading">
            <p className="eyebrow">Signature scroll</p>
            <h2>The center kullad keeps turning until this scroll section is done.</h2>
          </div>

          {items.map((item, index) => (
            <article
              key={item.id}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              className={`signature-card ${
                index === activeIndex ? "is-active" : ""
              }`}
              style={{ "--card-accent": item.accent } as CSSProperties}
            >
              <div className="menu-card-topline">
                <span>{item.label}</span>
                <strong>{item.price}</strong>
              </div>
              <h3>{item.mood}</h3>
              <p>{item.description}</p>
              <ul className="menu-notes" aria-label={`${item.label} notes`}>
                {item.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <section className="all-signatures-section">
        <div className="section-heading all-signatures-heading">
          <p className="eyebrow">All signatures</p>
          <h2>Once the pinned stage ends, the full chai collection scrolls freely.</h2>
        </div>

        <div className="all-signatures-grid">
          {items.map((item) => (
            <article
              key={item.id}
              className="catalog-card"
              style={{ "--card-accent": item.accent } as CSSProperties}
            >
              <div className="menu-card-topline">
                <span>{item.label}</span>
                <strong>{item.price}</strong>
              </div>
              <h3>{item.mood}</h3>
              <p>{item.description}</p>
              <ul className="menu-notes" aria-label={`${item.label} tasting notes`}>
                {item.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
