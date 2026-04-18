import type { Recipe } from '@/lib/types';

export interface FridgeScanOptions {
  base64Image: string; // Base64 encoded image string (without data URL prefix)
  imageMimeType: string;
  cuisinePreferences?: string[];
  dietaryRestrictions?: string[];
}

export async function scanFridgeForRecipes(options: FridgeScanOptions): Promise<Partial<Recipe>[]> {
  const prompt = `You are an expert AI chef. I will provide an image of the inside of my fridge or pantry.
Please scan the image and identify all visible edible ingredients. 
Based ALMOST ENTIRELY on these found ingredients, suggest 3 distinct, practical recipes I could cook right now.
Assume I have basic pantry staples (salt, pepper, cooking oil, basic spices, water).

${options.dietaryRestrictions?.length ? `CRITICAL Dietary constraints: ${options.dietaryRestrictions.join(', ')}` : ''}
${options.cuisinePreferences?.length ? `Preferred cuisines (if possible with ingredients): ${options.cuisinePreferences.join(', ')}` : ''}

CRITICAL: Return the response strictly as a JSON array of objects. Do not include markdown code blocks (like \`\`\`json) or any conversational text. Return only the raw JSON.
Format:
[
  {
    "name": "Recipe Name",
    "cuisineName": "General",
    "prepTimeMinutes": 10,
    "cookTimeMinutes": 20,
    "servings": 2,
    "ingredients": [
      { "name": "Ingredient directly from Image", "quantity": "2", "unit": "pcs", "isOptional": false }
    ],
    "instructions": [
      { "stepNumber": 1, "text": "Chop the ingredient.", "durationMinutes": 5 }
    ]
  }
]
`;

  const response = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      base64Image: options.base64Image,
      imageMimeType: options.imageMimeType,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to reach AI service');
  }

  const { success, text, error } = await response.json();

  if (!success) {
    throw new Error(error || 'AI analysis failed');
  }

  // Clean the text in case AI added markdown
  let rawJson = text.trim();
  if (rawJson.startsWith('```json')) {
    rawJson = rawJson.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (rawJson.startsWith('```')) {
    rawJson = rawJson.replace(/^```/, '').replace(/```$/, '').trim();
  }

  try {
    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed)) {
      throw new Error('Expected a JSON array of recipes');
    }
    return parsed as Partial<Recipe>[];
  } catch (err) {
    console.error('Failed to parse AI response JSON:', rawJson);
    throw new Error('Invalid JSON format returned by AI');
  }
}
