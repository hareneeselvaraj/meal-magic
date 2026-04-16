/**
 * Google Drive Authentication using Google Identity Services (GIS)
 * Uses OAuth 2.0 token flow — no server needed.
 * Only requests drive.appdata scope (hidden app folder, not user's Drive).
 */

declare const google: any;

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

let tokenClient: any = null;
let accessToken: string | null = null;

export function isDriveConfigured(): boolean {
  return !!CLIENT_ID;
}

export function isDriveLinked(): boolean {
  return !!accessToken || localStorage.getItem('drive-linked') === '1';
}

export function initDriveAuth(): Promise<void> {
  if (!CLIENT_ID) return Promise.resolve();
  return new Promise((resolve) => {
    if (tokenClient) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.onload = () => {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: () => {}, // overridden per-call
      });
      resolve();
    };
    s.onerror = () => resolve();
    document.body.appendChild(s);
  });
}

export function signIn(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error('Drive auth not initialized. Set VITE_GOOGLE_CLIENT_ID.'));
    tokenClient.callback = (resp: any) => {
      if (resp.error) return reject(new Error(resp.error));
      accessToken = resp.access_token;
      localStorage.setItem('drive-linked', '1');
      resolve(accessToken!);
    };
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export function signOut() {
  accessToken = null;
  localStorage.removeItem('drive-linked');
}

export function getToken(): string | null {
  return accessToken;
}
