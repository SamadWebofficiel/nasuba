'use server';

import { cookies } from 'next/headers';

export async function createSession(uid) {
  const cookieStore = await cookies();
  
  // Set a session cookie that expires in 7 days
  cookieStore.set('admin_session', uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  });
}

export async function removeSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}
