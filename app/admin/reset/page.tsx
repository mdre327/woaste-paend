import Link from "next/link";
import {
  isPasswordResetTokenValid,
  redirectIfAdminAuthenticated,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type ResetPageProps = {
  searchParams: Promise<{
    error?: string;
    token?: string;
  }>;
};

const getResetErrorMessage = (error?: string) => {
  if (error === "missing-token") {
    return "The reset link is missing a token.";
  }

  if (error === "weak-password") {
    return "Use a password with at least 8 characters.";
  }

  if (error === "mismatch") {
    return "The passwords did not match.";
  }

  if (error === "invalid-token") {
    return "This reset link has expired or is no longer valid.";
  }

  return null;
};

export default async function AdminResetPage({ searchParams }: ResetPageProps) {
  await redirectIfAdminAuthenticated();

  const state = await searchParams;
  const token = state.token ?? "";
  const isValidToken = token ? await isPasswordResetTokenValid(token) : false;
  const errorMessage = getResetErrorMessage(state.error);

  return (
    <main className="page-shell">
      <div className="auth-grid">
        <section className="auth-card">
          <p className="eyebrow">Complete reset</p>
          <h1>Choose a new admin password.</h1>
          <p className="page-hero-copy">
            This updates the stored admin password in the backend and clears any
            active sessions for the account.
          </p>

          {errorMessage ? <p className="auth-notice">{errorMessage}</p> : null}

          {!isValidToken ? (
            <div className="auth-reset-card">
              <strong>Reset link unavailable</strong>
              <p>Request a fresh link to continue.</p>
              <Link href="/admin/forgot" className="secondary-action auth-reset-link">
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form action="/api/admin/reset" method="post" className="auth-form">
              <input type="hidden" name="token" value={token} />

              <label className="admin-field">
                <span>New password</span>
                <input
                  type="password"
                  name="password"
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>

              <label className="admin-field">
                <span>Confirm password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>

              <div className="auth-actions">
                <button type="submit" className="primary-action">
                  Save new password
                </button>
                <Link href="/admin/login" className="secondary-action">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </section>

        <section className="info-card auth-side-card">
          <p className="eyebrow">Session policy</p>
          <h2>Reset clears prior access</h2>
          <p>
            Any active admin session is removed when the password changes, so only
            the new credentials remain valid.
          </p>
        </section>
      </div>
    </main>
  );
}
