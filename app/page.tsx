import ChaiExperience from "@/components/chai-experience";
import HomeHeroStats from "@/components/home-hero-stats";
import WoategiPreview from "@/components/woategi-preview";
import { chaiMenu } from "@/lib/chai-menu";
import { listEvents } from "@/lib/server-events";
import { testimonials } from "@/lib/testimonials";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await listEvents();

  return (
    <main className="page-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-pills">
            <span className="hero-pill">Kullad-first service</span>
            <span className="hero-pill">Events-led chai house</span>
          </div>
          <p className="eyebrow">Clay-fired comfort</p>
          <h1>woaste-paend turns chai service into a visual, tactile food experience.</h1>
          <p className="hero-description">
            Built around rotating kullad moments, signature pours, and
            event-driven evenings, the house blends mitti warmth with green-blue
            accents to make every chai stop feel designed rather than generic.
          </p>
          <div className="hero-actions">
            <a href="#experience" className="primary-action">
              Explore pours
            </a>
            <a href="#woategi" className="secondary-action">
              See Woategi events
            </a>
          </div>

          <div className="hero-strip">
            <span>Earthenware service</span>
            <span>Signature chai flights</span>
            <span>Live event calendar</span>
          </div>
        </div>

        <div className="hero-showcase" aria-label="Shop highlights">
          <article className="hero-feature hero-feature-primary">
            <p className="eyebrow">House special</p>
            <h2>Mitti Classic served in a fresh-fired kullad.</h2>
            <p>
              Deep Assam body, jaggery finish, and a clay rim built to hold the
              first wave of aroma longer.
            </p>
          </article>

          <HomeHeroStats events={events} testimonials={testimonials} />
        </div>
      </section>

      <ChaiExperience items={chaiMenu} />
      <WoategiPreview events={events} />
    </main>
  );
}
