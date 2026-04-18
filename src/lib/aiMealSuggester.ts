import { extractWithAI } from './aiFetcher';

export interface MealSuggestion {
  recipeName: string;
  whyItHelps: string;
  timeEstimate: string;
}

export async function suggestMeals(params: {
  inventory: string[];
  healthFocus: string;
  recentMeals: string[];
  timeOfDay: string;
  deficiencies: string[];
}): Promise<MealSuggestion[]> {
  const prompt = `
You are a nutritionist for a person with health focus: ${params.healthFocus}.
They have the following nutrient deficiencies: ${params.deficiencies.length > 0 ? params.deficiencies.join(', ') : 'None'}.
Their current grocery inventory: ${params.inventory.join(', ')}.
They already ate these meals this week (avoid repeating): ${params.recentMeals.join(', ')}.

Context: The time of day is ${params.timeOfDay}.
Suggest exactly 5 meals (morning juice, breakfast, lunch, snack, dinner) that maximize their available inventory and address their health goals.

Return ONLY a clean JSON array of objects with no markdown formatting.
Each object MUST have this exact shape:
{
  "recipeName": "Name of the dish",
  "whyItHelps": "1 short sentence explaining why it fits their profile",
  "timeEstimate": "e.g., 20 mins"
}
`;

  const result = await extractWithAI(prompt);
  try {
    const cleanJson = result.replace(/```json/gi, '').replace(/```/gi, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error('Failed to parse suggestions:', e);
    throw new Error('Failed to parse AI suggestions');
  }
}
