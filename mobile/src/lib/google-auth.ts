import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { api } from './api';

// "Google orqali kirish" on the phone, without an extra Android OAuth client:
//   app -> Google sign-in page (Chrome Custom Tab)
//       -> PULSE web /google-callback (registered redirect URI, token in the #fragment)
//       -> pulse://google-auth?id_token=…&state=…  (back into the app)
// The token is bound to sha256(nonce); the backend only accepts it together
// with the nonce, which never leaves this app until that final request.

const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL || 'https://pulse-web-sanjar2.vercel.app').replace(/\/$/, '');
export const GOOGLE_CALLBACK = `${WEB_URL}/google-callback`;
export const GOOGLE_RETURN = 'pulse://google-auth';

const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

let clientId: string | null | undefined; // undefined = not fetched yet
export async function googleClientId(): Promise<string | null> {
  if (clientId !== undefined) return clientId;
  const { data } = await api.get<{ googleClientId: string | null }>('/auth/config');
  clientId = data.googleClientId || null;
  return clientId;
}

export class GoogleCancelled extends Error {}

/** Opens Google, returns the ID token + the nonce secret it is bound to. */
export async function signInWithGoogleBrowser(): Promise<{ credential: string; nonce: string }> {
  const id = await googleClientId().catch(() => {
    throw new Error("Server bilan aloqa yo'q. Internetni tekshirib, qayta urinib ko'ring.");
  });
  if (!id) throw new Error('Google orqali kirish hozircha sozlanmagan.');

  const nonce = hex(Crypto.getRandomBytes(32));
  const state = hex(Crypto.getRandomBytes(16));
  const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
  const query = Object.entries({
    client_id: id,
    redirect_uri: GOOGLE_CALLBACK,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: hashed,
    state,
    prompt: 'select_account',
  })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

  // Safety net: on Android the app-resume and the deep link race each other;
  // keep the deep link ourselves so a "dismiss" never loses a finished sign-in.
  let caught: string | null = null;
  const sub = Linking.addEventListener('url', ({ url }) => {
    if (url.startsWith(GOOGLE_RETURN)) caught = url;
  });
  let returned: string | null = null;
  try {
    const res = await WebBrowser.openAuthSessionAsync(`https://accounts.google.com/o/oauth2/v2/auth?${query}`, GOOGLE_RETURN);
    returned = res.type === 'success' ? res.url : caught;
  } finally {
    sub.remove();
  }
  if (!returned) throw new GoogleCancelled();

  const params = Linking.parse(returned).queryParams ?? {};
  const one = (k: string) => {
    const v = params[k];
    return typeof v === 'string' ? v : undefined;
  };
  if (one('error')) {
    if (one('error') === 'access_denied') throw new GoogleCancelled();
    throw new Error("Google orqali kirib bo'lmadi. Qayta urinib ko'ring.");
  }
  const credential = one('id_token');
  if (!credential || one('state') !== state) throw new Error("Google javobi noto'g'ri. Qayta urinib ko'ring.");
  return { credential, nonce };
}
