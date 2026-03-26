import Link from "next/link";
import {
  getAdminLoginHints,
  redirectIfAdminAuthenticated,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type ForgotPageProps = {
  searchParams: Promise<{
    error?: string;
    sent?: string;
    token?: string;
  }>;
};

export default async function AdminForgotPage({ searchParams }: ForgotPageProps) {
  await redirectIfAdminAuthenticated();

  const state = await searchParams;
  const hints = getAdminLoginHints();
  const resetLink = state.token ? `/admin/reset?token=${state.token}` : null;

  return (
    <main className="page-shell">
      <div className="auth-grid">
        <section className="auth-card">
          <p className="eyebrow">Password reset</p>
          <h1>Request a new admin password.</h1>
          <p className="page-hero-copy">
            This flow creates a reset token in the backend. Until email delivery
            is added, the generated reset link is surfaced here after submission.
          </p>

          {state.error === "missing" ? (
            <p className="auth-notice">Enter the admin username or email first.</p>
          ) : null}

          {state.sent === "1" ? (
            <p className="auth-notice">
              Reset request recorded. If the admin account exists, a reset link is
              available below.
            </p>
          ) : null}

          <form action="/api/admin/forgot" method="post" className="auth-form">
            <label className="admin-field">
              <span>Username or email</span>
              <input
                type="text"
                name="identifier"
                defaultValue={hints.email}
                autoComplete="username"
              />
            </label>

            <div className="auth-actions">
              <button type="submit" className="primary-action">
                Generate reset link
              </button>
              <Link href="/admin/login" className="secondary-action">
                Back to login
              </Link>
            </div>
          </form>

          {resetLink ? (
            <div className="auth-reset-card">
              <strong>Current reset link</strong>
              <p>Use this link now, or replace it later with email delivery.</p>
              <Link href={resetLink} className="secondary-action auth-reset-link">
                Open reset page
              </Link>
            </div>
          ) : null}
        </section>

        <section className="info-card auth-side-card">
          <p className="eyebrow">Auth seam</p>
          <h2>Ready for real mail delivery</h2>
          <p>
            Reset requests are already created and stored server-side. You can
            later wire this route into an email or SMS provider without changing
            the admin UI.
          </p>
        </section>
      </div>
    </main>
  );
}
