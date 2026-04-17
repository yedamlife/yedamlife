import { cookies } from 'next/headers';

export interface AdminUser {
  email: string;
  name: string;
  role: string;
  avatar_url: string | null;
}

const COOKIE_NAME = 'admin_session';

const DEV_ADMIN: AdminUser = {
  email: 'dahunee37@gmail.com',
  name: 'DAHUN LEE',
  role: 'super_admin',
  avatar_url: null,
};

export function isLocalhost(host: string | null): boolean {
  if (!host) return false;
  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}

export async function getAdminSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (!session?.value) return null;

  try {
    return JSON.parse(session.value) as AdminUser;
  } catch {
    return null;
  }
}

export async function setAdminSession(user: AdminUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7일
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { DEV_ADMIN };
