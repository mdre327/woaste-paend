import Link from "next/link";
import { redirectIfAdminAuthenticated, getAdminLoginHints } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    expired?: string;
    loggedOut?: string;
    reset?: string;
  }>;
};

const getLoginNotice = (state: {
  error?: string;
  expired?: string;
  loggedOut?: string;
  reset?: string;
}) => {
  if (state.error === "missing") {
    return "Enter your username or email and password.";
  }

  if (state.error === "invalid") {
    return "The login details did not match the admin account.";
  }

  if (state.expired === "1") {
    return "Your admin session expired. Sign in again to continue.";
  }

  if (state.loggedOut === "1") {
    return "You have been logged out.";
  }

  if (state.reset === "1") {
    return "Password updated. Sign in with your new password.";
  }

  return null;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  await redirectIfAdminAuthenticated();

  const state = await searchParams;
  const notice = getLoginNotice(state);
  const hints = getAdminLoginHints();

  return (
    <main className="page-shell">
      <div className="auth-grid">
        <section className="auth-card">
          <p className="eyebrow">Private admin access</p>
          <h1>Sign in to manage Woategi events.</h1>
          <p className="page-hero-copy">
            This admin route is hidden from the public site and now uses the app
            backend for login, sessions, and password reset handling.
          </p>

          {notice ? <p className="auth-notice">{notice}</p> : null}

          <form action="/api/admin/login" method="post" className="auth-form">
            <label className="admin-field">
              <span>Username or email</span>
              <input
                type="text"
                name="identifier"
                defaultValue={hints.username}
                autoComplete="username"
              />
            </label>

            <label className="admin-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
              />
            </label>

            <div className="auth-actions">
              <button type="submit" className="primary-action">
                Sign in
              </button>
              <Link href="/admin/forgot" className="secondary-action">
                Forgot password
              </Link>
            </div>
          </form>
        </section>

        <section className="info-card auth-side-card">
          <p className="eyebrow">Seed admin</p>
          <h2>Backend-managed credentials</h2>
          <p>
            The first admin record is seeded into the app data store and can be
            overridden later with `WOASTE_ADMIN_USERNAME`, `WOASTE_ADMIN_EMAIL`,
            and `WOASTE_ADMIN_PASSWORD`.
          </p>
          <p className="auth-meta-line">Default username: {hints.username}</p>
          <p className="auth-meta-line">Default email: {hints.email}</p>
        </section>
      </div>
    </main>
  );
}
