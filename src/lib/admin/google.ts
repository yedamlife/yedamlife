interface GoogleTokenInfo {
  iss: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: string | boolean;
  name?: string;
  picture?: string;
  exp: string | number;
}

const VALID_ISSUERS = new Set(['https://accounts.google.com', 'accounts.google.com']);

export interface VerifiedGoogleUser {
  email: string;
  name: string;
  picture: string | null;
}

export async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleUser> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured');
  }

  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    { cache: 'no-store' },
  );
  if (!res.ok) {
    throw new Error('invalid_token');
  }

  const info = (await res.json()) as GoogleTokenInfo;

  if (!VALID_ISSUERS.has(info.iss)) {
    throw new Error('invalid_issuer');
  }
  if (info.aud !== clientId) {
    throw new Error('invalid_audience');
  }
  if (String(info.email_verified) !== 'true') {
    throw new Error('email_not_verified');
  }
  const exp = typeof info.exp === 'string' ? parseInt(info.exp, 10) : info.exp;
  if (!exp || Date.now() / 1000 >= exp) {
    throw new Error('token_expired');
  }

  return {
    email: info.email,
    name: info.name ?? info.email,
    picture: info.picture ?? null,
  };
}
