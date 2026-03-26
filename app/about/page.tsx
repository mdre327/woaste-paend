export default function AboutPage() {
  return (
    <main className="page-shell route-shell">
      <section className="page-hero">
        <p className="eyebrow">About us</p>
        <h1>Woaste Paend is a kullad chai house built around ritual, clay, and slower evenings.</h1>
        <p className="page-hero-copy">
          We serve chai in earthen cups because aroma, warmth, and memory matter.
          The house blends tea service, events, and tactile design into one
          small-format food experience.
        </p>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <p className="eyebrow">What we do</p>
          <h2>Signature chai pours with a strong visual identity.</h2>
          <p>
            From Mitti Classic to Coastal Blue, every drink is designed to feel
            distinct in both flavor and presentation.
          </p>
        </article>

        <article className="info-card">
          <p className="eyebrow">Why clay</p>
          <h2>Kullad service changes the first sip.</h2>
          <p>
            Earthenware holds warmth differently, softens aroma release, and
            gives the cup a textured identity that paper or glass cannot match.
          </p>
        </article>

        <article className="info-card">
          <p className="eyebrow">Woategi</p>
          <h2>Events extend the house beyond the counter.</h2>
          <p>
            Markets, baithaks, tasting nights, and community pours let the brand
            operate like a cultural food space, not just a beverage stall.
          </p>
        </article>
      </section>
    </main>
  );
}
