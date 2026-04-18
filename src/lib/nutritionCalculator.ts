import { extractWithAI } from './aiFetcher';

export interface NutritionResult {
  calories: number;
  protein_g: number;
  iron_mg: number;
  calcium_mg: number;
  folate_mcg: number;
  fiber_g: number;
}

export async function calculateDailyNutrition(params: {
  meals: { slot: string; recipeName: string; servings: number }[];
  profileType: string;
}): Promise<NutritionResult> {
  const prompt = `
Estimate the total daily dietary nutrition for these meals for a person with profile: ${params.profileType}.
Meal list:
${params.meals.map(m => `- ${m.slot}: ${m.recipeName} (${m.servings} serving(s))`).join('\n')}

Return exactly a JSON array containing ONLY one object with this shape:
{
  "calories": 1840,
  "protein_g": 62,
  "iron_mg": 14,
  "calcium_mg": 780,
  "folate_mcg": 420,
  "fiber_g": 20
}
No markdown blocks, no extra text.
`;

  try {
    const result = await extractWithAI(prompt);
    const cleanJson = result.replace(/```json/gi, '').replace(/```/gi, '').trim();
    return JSON.parse(cleanJson);
  } catch (e: any) {
    console.error('Failed to parse nutrition:', e);
    throw new Error('AI Nutrition calculation failed');
  }
}
