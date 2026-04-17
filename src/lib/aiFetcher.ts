/**
 * Frontend Proxy Fetcher
 * Sends requests to our secure Vercel Serverless Backend.
 * Never expose raw API keys in the browser bundle again!
 */

export async function extractWithAI(
  prompt: string,
  base64Image?: string,
  imageMimeType: string = 'image/jpeg'
): Promise<string> {
  const response = await fetch('/api/extract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      base64Image,
      imageMimeType,
    }),
  });

  if (!response.ok) {
    throw new Error(`Serverless API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(`AI Extraction failed: ${data.error}`);
  }

  return data.text;
}
