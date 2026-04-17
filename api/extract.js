export const config = {
  // Use edge computing for faster cold starts if desired, but node is fine for fetch calls.
  runtime: 'edge',
};

// ── State ────────────────────────────────────────────────
// Serverless environments can maintain some state between warm requests
let currentKeyIndex = 0;

function getKeys() {
  const csv = process.env.AI_API_KEYS;
  if (csv) return csv.split(',').map(k => k.trim()).filter(Boolean);
  
  // Fallback to legacy single-key env without VITE_ prefix
  const legacy = process.env.GEMINI_API_KEY;
  return legacy ? [legacy] : [];
}

function isGroqKey(key) {
  return key.startsWith('gsk_');
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt, base64Image, imageMimeType } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const keys = getKeys();
    if (keys.length === 0) {
      return new Response(JSON.stringify({ error: 'No AI API keys configured on server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let lastError = null;

    // Retry loop through all keys
    for (let attempt = 0; attempt < keys.length; attempt++) {
      const idx = (currentKeyIndex + attempt) % keys.length;
      const key = keys[idx];

      try {
        const textOut = isGroqKey(key)
          ? await callGroq(key, prompt, base64Image, imageMimeType || 'image/jpeg')
          : await callGemini(key, prompt, base64Image, imageMimeType || 'image/jpeg');

        // Success - remember index
        currentKeyIndex = idx;
        
        return new Response(JSON.stringify({ success: true, text: textOut }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      } catch (err) {
        const status = err.status || 0;
        const isQuotaError = status === 429 || status === 503 || status === 500;

        if (isQuotaError && attempt < keys.length - 1) {
          console.warn(`🔄 AI key #${idx + 1} hit limit (${status}), rotating to next key...`);
          continue;
        }
        lastError = err;
      }
    }

    throw lastError || new Error('All API keys exhausted');

  } catch (error) {
    console.error('API Extract Error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ── Gemini Provider ──────────────────────────────────────
async function callGemini(apiKey, prompt, base64Image, imageMimeType) {
  const parts = [{ text: prompt }];

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
    const err = new Error(`Gemini API error: ${resp.status}`);
    err.status = resp.status;
    throw err;
  }

  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── Groq Provider ────────────────────────────────────────
async function callGroq(apiKey, prompt, base64Image, imageMimeType) {
  const model = base64Image
    ? 'llama-3.2-90b-vision-preview'
    : 'llama-3.3-70b-versatile';

  const content = [{ type: 'text', text: prompt }];

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
    const err = new Error(`Groq API error: ${resp.status}`);
    err.status = resp.status;
    throw err;
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}
