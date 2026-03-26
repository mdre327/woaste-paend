export default function ContactPage() {
  return (
    <main className="page-shell route-shell">
      <section className="page-hero">
        <p className="eyebrow">Contact us</p>
        <h1>Reach the Woaste Paend team for bookings, collaborations, and chai pop-ups.</h1>
        <p className="page-hero-copy">
          Use these direct contact points for event partnerships, private pours,
          or any future catering conversation.
        </p>
      </section>

      <section className="contact-grid">
        <article className="info-card">
          <p className="eyebrow">Email</p>
          <h2>hello@woastepaend.in</h2>
          <p>General questions, venue requests, and brand collaborations.</p>
        </article>

        <article className="info-card">
          <p className="eyebrow">Phone</p>
          <h2>+91 90000 22110</h2>
          <p>Direct line for group bookings and same-week event coordination.</p>
        </article>

        <article className="info-card">
          <p className="eyebrow">House hours</p>
          <h2>10:00 AM to 11:00 PM</h2>
          <p>Late evening service is best for live pours and signature flights.</p>
        </article>
      </section>
    </main>
  );
}
