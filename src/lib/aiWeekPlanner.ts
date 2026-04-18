import { extractWithAI } from './aiFetcher';

export interface WeekPlanResult {
  [dateIso: string]: {
    morning_juice: string | null;
    breakfast: string | null;
    lunch: string | null;
    snack: string | null;
    dinner: string | null;
  };
}

export async function generateWeekPlan(params: {
  startDate: string;
  inventory: { name: string; quantity: number; unit: string }[];
  recipes: { id: string; name: string; mealSlot: string; healthTags: string[]; cuisineName?: string }[];
  deficiencies: string[];
  profileType: string;
}): Promise<WeekPlanResult> {
  const dates = [];
  const start = new Date(params.startDate);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getTime()); // copy
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const prompt = `
Plan 7 days of meals for a user with the health profile: ${params.profileType}.
Nutritional focus / deficiencies: ${params.deficiencies.length ? params.deficiencies.join(', ') : 'None'}.

Available recipes (Pick ONLY from these IDs):
${JSON.stringify(params.recipes)}

Current groceries inventory (Prefer using these ingredients):
${JSON.stringify(params.inventory)}

Rules:
- Do NOT repeat the same recipe ID within 3 days.
- Balance cuisines across the week.
- Assign exactly one valid recipeId for each meal slot per day. Use null if no recipe matches.
- The 7 dates are: ${dates.join(', ')}.

Return ONLY valid JSON matching this exact structure:
{
  "${dates[0]}": { "morning_juice": "recipeId", "breakfast": "recipeId", "lunch": "recipeId", "snack": "recipeId", "dinner": "recipeId" },
  "${dates[1]}": { ... },
  ...
}
No markdown blocks, no extra text.
`;

  try {
    const result = await extractWithAI(prompt);
    const cleanJson = result.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const parsed = JSON.parse(cleanJson);
    return parsed;
  } catch (e: any) {
    console.error('Failed to generate week plan:', e);
    throw new Error('AI Weekly Plan generation failed');
  }
}
