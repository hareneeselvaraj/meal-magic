/**
 * Google Drive Sync — backup/restore to AppData folder
 * Stores a single JSON file (meal-planner-backup.json) in the app's hidden folder.
 */

import { getToken } from './driveAuth';
import { readAll, writeAll } from './db';

const FILE_NAME = 'meal-planner-backup.json';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
const LIST_URL = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name%3D'${FILE_NAME}'`;

async function findFileId(): Promise<string | null> {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(LIST_URL, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

export async function getLastSyncTime(): Promise<string | null> {
  return localStorage.getItem('drive-last-sync');
}

export async function backupToDrive(): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Sign in to Drive first');

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    groceryItems: await readAll('groceryItems'),
    groceryCategories: await readAll('groceryCategories'),
    // Also backup localStorage data
    mp_recipes: JSON.parse(localStorage.getItem('mp_recipes') || '[]'),
    mp_mealPlans: JSON.parse(localStorage.getItem('mp_mealPlans') || '{}'),
    mp_cuisines: JSON.parse(localStorage.getItem('mp_cuisines') || '[]'),
    mp_profile: JSON.parse(localStorage.getItem('mp_profile') || '{}'),
  };

  const metadata = { name: FILE_NAME, parents: ['appDataFolder'] };
  const boundary = '-------mealplanner-' + Date.now();
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
    JSON.stringify(payload) +
    `\r\n--${boundary}--`;

  const existing = await findFileId();
  const url = existing
    ? `https://www.googleapis.com/upload/drive/v3/files/${existing}?uploadType=multipart`
    : UPLOAD_URL;

  const res = await fetch(url, {
    method: existing ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) throw new Error(`Drive upload failed: ${res.status}`);
  localStorage.setItem('drive-last-sync', new Date().toISOString());
}

export async function restoreFromDrive(): Promise<boolean> {
  const token = getToken();
  if (!token) throw new Error('Sign in to Drive first');

  const id = await findFileId();
  if (!id) return false; // No backup found

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Drive download failed: ${res.status}`);

  const data = await res.json();

  // Restore IndexedDB data
  if (data.groceryItems?.length) await writeAll('groceryItems', data.groceryItems);
  if (data.groceryCategories?.length) await writeAll('groceryCategories', data.groceryCategories);

  // Restore localStorage data
  if (data.mp_recipes) localStorage.setItem('mp_recipes', JSON.stringify(data.mp_recipes));
  if (data.mp_mealPlans) localStorage.setItem('mp_mealPlans', JSON.stringify(data.mp_mealPlans));
  if (data.mp_cuisines) localStorage.setItem('mp_cuisines', JSON.stringify(data.mp_cuisines));
  if (data.mp_profile) localStorage.setItem('mp_profile', JSON.stringify(data.mp_profile));

  localStorage.setItem('drive-last-sync', new Date().toISOString());
  return true;
}
