import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-change-this-in-production';
const key = new TextEncoder().encode(SECRET_KEY);

export async function signSession(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function verifySession(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (e) {
        return null;
    }
}

export async function getSession() {
    const cookieStore = cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return null;
    return await verifySession(token);
}
