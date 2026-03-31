import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const PLAYER_SESSION_COOKIE = "phet_player_session";
const ADMIN_SESSION_COOKIE = "phet_admin_session";
const PLAYER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  exp: number;
  type: "admin" | "player";
};

export type PlayerSessionPayload = SessionPayload & {
  playerId: number;
  type: "player";
  uid: string;
};

export type AdminSessionPayload = SessionPayload & {
  accessToken: string;
  role: "admin";
  type: "admin";
};

function getSessionSecret() {
  return process.env.APP_SESSION_SECRET || "local-dev-session-secret";
}

function encodeSession<T extends SessionPayload>(payload: T) {
  const rawPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSessionSecret())
    .update(rawPayload)
    .digest("base64url");

  return `${rawPayload}.${signature}`;
}

function decodeSession<T extends SessionPayload>(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const [rawPayload, rawSignature] = token.split(".");

  if (!rawPayload || !rawSignature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", getSessionSecret())
    .update(rawPayload)
    .digest("base64url");

  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(rawSignature);

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(rawPayload, "base64url").toString("utf8"),
    ) as T;

    if (payload.exp <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "research123";

  return {
    password,
    usingDefaults:
      !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD,
    username,
  };
}

function getJwtExpiration(token: string) {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
    }

    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { exp?: number };

    return parsed.exp
      ? parsed.exp * 1000
      : Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
  } catch {
    return Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
  }
}

export async function getPlayerSession() {
  const cookieStore = await cookies();

  return decodeSession<PlayerSessionPayload>(
    cookieStore.get(PLAYER_SESSION_COOKIE)?.value,
  );
}

export async function setPlayerSession(player: {
  playerId: number;
  uid: string;
}) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + PLAYER_SESSION_TTL_SECONDS * 1000;

  cookieStore.set(PLAYER_SESSION_COOKIE, encodeSession({
    exp: expiresAt,
    playerId: player.playerId,
    type: "player",
    uid: player.uid,
  }), {
    httpOnly: true,
    maxAge: PLAYER_SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearPlayerSession() {
  const cookieStore = await cookies();
  cookieStore.set(PLAYER_SESSION_COOKIE, "", {
    maxAge: 0,
    path: "/",
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();

  return decodeSession<AdminSessionPayload>(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
}

export async function setAdminSession(input: { accessToken: string }) {
  const cookieStore = await cookies();
  const expiresAt = getJwtExpiration(input.accessToken);

  cookieStore.set(ADMIN_SESSION_COOKIE, encodeSession({
    accessToken: input.accessToken,
    exp: expiresAt,
    role: "admin",
    type: "admin",
  }), {
    httpOnly: true,
    maxAge: Math.max(Math.floor((expiresAt - Date.now()) / 1000), 60),
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    maxAge: 0,
    path: "/admin",
  });
}
