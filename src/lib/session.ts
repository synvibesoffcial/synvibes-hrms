import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) throw new Error('SESSION_SECRET is not set');
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt<T extends Record<string, unknown>>(payload: T) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    console.log('Failed to verify session');
    return null;
  }
} 

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}