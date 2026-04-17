/**
 * Agnostic AI Fetcher — supports Gemini and Groq with automatic key rotation.
 *
 * Keys are read from VITE_AI_API_KEYS (comma-separated).
 * Falls back to legacy VITE_GEMINI_API_KEY if the new env var is absent.
 *
 * gsk_*  → Groq  (OpenAI-compatible, llama-3.3-70b-versatile for text, llama-3.2-90b-vision-preview for vision)
 * AIza*  → Gemini (Google, gemini-1.5-flash)
 */

// ── State ────────────────────────────────────────────────
let currentKeyIndex = 0;

function getKeys(): string[] {
  const csv = import.meta.env.VITE_AI_API_KEYS as string | undefined;
  if (csv) return csv.split(',').map(k => k.trim()).filter(Boolean);
  // Fallback to legacy single-key env
  const legacy = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  return legacy ? [legacy] : [];
}

function isGroqKey(key: string): boolean {
  return key.startsWith('gsk_');
}

// ── Core fetch with retry across keys ────────────────────
export async function extractWithAI(
  prompt: string,
  base64Image?: string,
  imageMimeType: string = 'image/jpeg'
): Promise<string> {
  const keys = getKeys();
  if (keys.length === 0) throw new Error('No AI API keys configured. Set VITE_AI_API_KEYS in .env.local');

  let lastError: Error | null = null;

  // Try each key starting from the current index
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const idx = (currentKeyIndex + attempt) % keys.length;
    const key = keys[idx];

    try {
      const result = isGroqKey(key)
        ? await callGroq(key, prompt, base64Image, imageMimeType)
        : await callGemini(key, prompt, base64Image, imageMimeType);

      // Success — remember this key for next time
      currentKeyIndex = idx;
      return result;
    } catch (err: any) {
      const status = err?.status ?? 0;
      const isQuotaError = status === 429 || status === 503 || status === 500;

      if (isQuotaError && attempt < keys.length - 1) {
        console.warn(`🔄 AI key #${idx + 1} hit limit (${status}), rotating to next key...`);
        continue;
      }
      lastError = err;
    }
  }

  throw lastError ?? new Error('All AI API keys exhausted');
}

// ── Gemini Provider ──────────────────────────────────────
async function callGemini(
  apiKey: string,
  prompt: string,
  base64Image?: string,
  imageMimeType: string = 'image/jpeg'
): Promise<string> {
  const parts: any[] = [{ text: prompt }];

  if (base64Image) {
    parts.push({
      inline_data: {
        mime_type: imageMimeType,
        data: base64Image,
      },
    });
  }

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
    }
  );

  if (!resp.ok) {
    const err: any = new Error(`Gemini API error: ${resp.status}`);
    err.status = resp.status;
    throw err;
  }

  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ── Groq Provider ────────────────────────────────────────
async function callGroq(
  apiKey: string,
  prompt: string,
  base64Image?: string,
  imageMimeType: string = 'image/jpeg'
): Promise<string> {
  const model = base64Image
    ? 'llama-3.2-90b-vision-preview'
    : 'llama-3.3-70b-versatile';

  const content: any[] = [{ type: 'text', text: prompt }];

  if (base64Image) {
    content.push({
      type: 'image_url',
      image_url: { url: `data:${imageMimeType};base64,${base64Image}` },
    });
  }

  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content }],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!resp.ok) {
    const err: any = new Error(`Groq API error: ${resp.status}`);
    err.status = resp.status;
    throw err;
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? '';
}
