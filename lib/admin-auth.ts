import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE_NAME = "woaste_paend_admin_session";

const authDataFilePath = path.join(process.cwd(), "data", "admin-auth.json");
const sessionMaxAgeMs = 1000 * 60 * 60 * 24 * 7;
const resetTokenMaxAgeMs = 1000 * 60 * 60;

type AdminUser = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  updatedAt: string;
};

type AdminSession = {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
};

type PasswordResetRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
};

type AdminAuthStore = {
  users: AdminUser[];
  sessions: AdminSession[];
  resetTokens: PasswordResetRecord[];
};

const normalizeIdentifier = (value: string) => value.trim().toLowerCase();

const hashValue = (value: string) =>
  createHash("sha256").update(value).digest("hex");

const hashPassword = (password: string, salt: string) =>
  scryptSync(password, salt, 64).toString("hex");

const createPasswordRecord = (password: string) => {
  const salt = randomBytes(16).toString("hex");

  return {
    salt,
    hash: hashPassword(password, salt),
  };
};

const verifyPassword = (
  password: string,
  salt: string,
  expectedHash: string,
) => {
  const actualHash = hashPassword(password, salt);
  const expectedBuffer = Buffer.from(expectedHash, "hex");
  const actualBuffer = Buffer.from(actualHash, "hex");

  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
};

const getSeedAdminCredentials = () => {
  return {
    username: normalizeIdentifier(process.env.WOASTE_ADMIN_USERNAME ?? "admin"),
    email: normalizeIdentifier(
      process.env.WOASTE_ADMIN_EMAIL ?? "admin@woaste-paend.local",
    ),
    password: process.env.WOASTE_ADMIN_PASSWORD ?? "KulladHouse!2026",
  };
};

const createDefaultAuthStore = (): AdminAuthStore => {
  const now = new Date().toISOString();
  const credentials = getSeedAdminCredentials();
  const password = createPasswordRecord(credentials.password);

  return {
    users: [
      {
        id: "primary-admin",
        username: credentials.username,
        email: credentials.email,
        passwordHash: password.hash,
        passwordSalt: password.salt,
        createdAt: now,
        updatedAt: now,
      },
    ],
    sessions: [],
    resetTokens: [],
  };
};

const ensureAuthStore = async () => {
  try {
    await fs.access(authDataFilePath);
  } catch {
    await fs.mkdir(path.dirname(authDataFilePath), { recursive: true });
    await fs.writeFile(
      authDataFilePath,
      JSON.stringify(createDefaultAuthStore(), null, 2),
      "utf8",
    );
  }
};

const readAuthStore = async () => {
  await ensureAuthStore();

  try {
    const fileContents = await fs.readFile(authDataFilePath, "utf8");
    const parsed = JSON.parse(fileContents) as AdminAuthStore;

    return parsed;
  } catch {
    return createDefaultAuthStore();
  }
};

const writeAuthStore = async (store: AdminAuthStore) => {
  await fs.writeFile(authDataFilePath, JSON.stringify(store, null, 2), "utf8");
};

const pruneExpiredEntries = (store: AdminAuthStore) => {
  const now = Date.now();

  return {
    ...store,
    sessions: store.sessions.filter(
      (session) => new Date(session.expiresAt).getTime() > now,
    ),
    resetTokens: store.resetTokens.filter(
      (resetToken) => new Date(resetToken.expiresAt).getTime() > now,
    ),
  };
};

const findUserByIdentifier = (store: AdminAuthStore, identifier: string) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);

  return (
    store.users.find((user) => {
      return (
        user.username === normalizedIdentifier || user.email === normalizedIdentifier
      );
    }) ?? null
  );
};

const getSessionTokenFromCookieHeader = (cookieHeader: string | null) => {
  if (!cookieHeader) {
    return null;
  }

  const pairs = cookieHeader.split(";").map((part) => part.trim());

  for (const pair of pairs) {
    const [name, ...valueParts] = pair.split("=");

    if (name === ADMIN_SESSION_COOKIE_NAME) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
};

export const getAdminSessionCookie = (token: string) => ({
  name: ADMIN_SESSION_COOKIE_NAME,
  value: token,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: Math.floor(sessionMaxAgeMs / 1000),
});

export const getClearedAdminSessionCookie = () => ({
  name: ADMIN_SESSION_COOKIE_NAME,
  value: "",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 0,
});

export const getAdminLoginHints = () => {
  const credentials = getSeedAdminCredentials();

  return {
    username: credentials.username,
    email: credentials.email,
  };
};

export const createAdminSession = async (identifier: string, password: string) => {
  const store = pruneExpiredEntries(await readAuthStore());
  const user = findUserByIdentifier(store, identifier);

  if (
    !user ||
    !verifyPassword(password, user.passwordSalt, user.passwordHash)
  ) {
    await writeAuthStore(store);
    return null;
  }

  const token = randomBytes(32).toString("hex");
  const nextStore: AdminAuthStore = {
    ...store,
    sessions: [
      ...store.sessions,
      {
        id: randomUUID(),
        userId: user.id,
        tokenHash: hashValue(token),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + sessionMaxAgeMs).toISOString(),
      },
    ],
  };

  await writeAuthStore(nextStore);

  return {
    token,
    user,
  };
};

export const getAdminUserForSessionToken = async (token: string) => {
  const store = pruneExpiredEntries(await readAuthStore());
  const tokenHash = hashValue(token);
  const session = store.sessions.find((entry) => entry.tokenHash === tokenHash);

  await writeAuthStore(store);

  if (!session) {
    return null;
  }

  return store.users.find((user) => user.id === session.userId) ?? null;
};

export const invalidateAdminSession = async (token: string | null) => {
  if (!token) {
    return;
  }

  const store = pruneExpiredEntries(await readAuthStore());
  const tokenHash = hashValue(token);
  const nextStore: AdminAuthStore = {
    ...store,
    sessions: store.sessions.filter((session) => session.tokenHash !== tokenHash),
  };

  await writeAuthStore(nextStore);
};

export const createPasswordResetRequest = async (identifier: string) => {
  const store = pruneExpiredEntries(await readAuthStore());
  const user = findUserByIdentifier(store, identifier);

  if (!user) {
    await writeAuthStore(store);
    return null;
  }

  const token = randomBytes(32).toString("hex");
  const nextStore: AdminAuthStore = {
    ...store,
    resetTokens: [
      ...store.resetTokens.filter((resetToken) => resetToken.userId !== user.id),
      {
        id: randomUUID(),
        userId: user.id,
        tokenHash: hashValue(token),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + resetTokenMaxAgeMs).toISOString(),
      },
    ],
  };

  await writeAuthStore(nextStore);

  return {
    token,
    user,
  };
};

export const isPasswordResetTokenValid = async (token: string) => {
  const store = pruneExpiredEntries(await readAuthStore());
  const tokenHash = hashValue(token);
  const resetToken = store.resetTokens.find((entry) => entry.tokenHash === tokenHash);

  await writeAuthStore(store);

  return Boolean(resetToken);
};

export const resetAdminPassword = async (token: string, nextPassword: string) => {
  const store = pruneExpiredEntries(await readAuthStore());
  const tokenHash = hashValue(token);
  const resetToken = store.resetTokens.find((entry) => entry.tokenHash === tokenHash);

  if (!resetToken) {
    await writeAuthStore(store);
    return false;
  }

  const password = createPasswordRecord(nextPassword);
  const now = new Date().toISOString();
  const nextStore: AdminAuthStore = {
    users: store.users.map((user) => {
      if (user.id !== resetToken.userId) {
        return user;
      }

      return {
        ...user,
        passwordHash: password.hash,
        passwordSalt: password.salt,
        updatedAt: now,
      };
    }),
    sessions: store.sessions.filter((session) => session.userId !== resetToken.userId),
    resetTokens: store.resetTokens.filter(
      (entry) => entry.userId !== resetToken.userId,
    ),
  };

  await writeAuthStore(nextStore);

  return true;
};

export const getAdminUserFromRequest = async (request: Request) => {
  const sessionToken = getSessionTokenFromCookieHeader(
    request.headers.get("cookie"),
  );

  if (!sessionToken) {
    return null;
  }

  return getAdminUserForSessionToken(sessionToken);
};

export const requireAdminRequest = async (request: Request) => {
  return getAdminUserFromRequest(request);
};

export const requireAdminPageSession = async () => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? null;

  if (!sessionToken) {
    redirect("/admin/login");
  }

  const user = await getAdminUserForSessionToken(sessionToken);

  if (!user) {
    redirect("/admin/login?expired=1");
  }

  return user;
};

export const redirectIfAdminAuthenticated = async () => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? null;

  if (!sessionToken) {
    return;
  }

  const user = await getAdminUserForSessionToken(sessionToken);

  if (user) {
    redirect("/admin");
  }
};
