import type { Recipe } from '@/lib/types';

type PDFLanguage = 'en' | 'ta';

// ── English → Tamil translation dictionary for cooking terms ──
const TAMIL_DICT: Record<string, string> = {
  // Proteins
  'chicken': 'சிக்கன்', 'mutton': 'மட்டன்', 'fish': 'மீன்', 'egg': 'முட்டை',
  'eggs': 'முட்டைகள்', 'prawn': 'இறால்', 'shrimp': 'இறால்', 'paneer': 'பன்னீர்',
  // Grains & Staples
  'rice': 'அரிசி', 'basmati rice': 'பாஸ்மதி அரிசி', 'flour': 'மாவு',
  'wheat flour': 'கோதுமை மாவு', 'urad dal': 'உளுந்து', 'toor dal': 'துவரம் பருப்பு',
  'chana dal': 'கடலை பருப்பு', 'moong dal': 'பாசி பருப்பு',
  // Vegetables
  'onion': 'வெங்காயம்', 'onions': 'வெங்காயம்', 'onions (sliced)': 'வெங்காயம் (நறுக்கியது)',
  'tomato': 'தக்காளி', 'tomatoes': 'தக்காளி', 'potato': 'உருளைக்கிழங்கு',
  'potatoes': 'உருளைக்கிழங்கு', 'carrot': 'கேரட்', 'carrots': 'கேரட்',
  'beetroot': 'பீட்ரூட்', 'drumstick': 'முருங்கைக்காய்', 'brinjal': 'கத்தரிக்காய்',
  'peas': 'பட்டாணி', 'beans': 'பீன்ஸ்', 'cabbage': 'முட்டைகோஸ்',
  'cauliflower': 'காலிஃப்ளவர்', 'spinach': 'பாலக் கீரை',
  // Spices & Herbs
  'salt': 'உப்பு', 'pepper': 'மிளகு', 'turmeric': 'மஞ்சள்', 'turmeric powder': 'மஞ்சள் தூள்',
  'red chili powder': 'மிளகாய்த்தூள்', 'chili powder': 'மிளகாய்த்தூள்',
  'cumin': 'சீரகம்', 'cumin seeds': 'சீரகம்', 'mustard seeds': 'கடுகு',
  'coriander': 'கொத்தமல்லி', 'coriander leaves': 'கொத்தமல்லி இலைகள்',
  'coriander powder': 'தனியா தூள்', 'coriander leaves (for garnish)': 'கொத்தமல்லி இலைகள் (கார்னிஷ்)',
  'mint': 'புதினா', 'mint leaves': 'புதினா இலைகள்', 'curry leaves': 'கறிவேப்பிலை',
  'garam masala': 'கரம் மசாலா', 'biryani masala': 'பிரியாணி மசாலா',
  'masala': 'மசாலா', 'sambar powder': 'சாம்பார் பொடி',
  'fenugreek': 'வெந்தயம்', 'fenugreek seeds': 'வெந்தயம்',
  'fennel': 'பெருஞ்சீரகம்', 'fennel seeds': 'பெருஞ்சீரகம்',
  'cardamom': 'ஏலக்காய்', 'cinnamon': 'பட்டை', 'cinnamon stick': 'பட்டை',
  'cloves': 'கிராம்பு', 'clove': 'கிராம்பு', 'bay leaves': 'பிரிஞ்சி இலை',
  'bay leaf': 'பிரிஞ்சி இலை', 'star anise': 'அன்னாசிப்பூ',
  'saffron': 'குங்குமப்பூ', 'saffron (in warm milk)': 'குங்குமப்பூ (சூடான பாலில்)',
  'nutmeg': 'ஜாதிக்காய்', 'mace': 'ஜாதிபத்திரி',
  'green chilies': 'பச்சை மிளகாய்', 'green chili': 'பச்சை மிளகாய்',
  'red chili': 'சிவப்பு மிளகாய்', 'dried red chilies': 'காய்ந்த மிளகாய்',
  // Dairy & Fats
  'ghee': 'நெய்', 'butter': 'வெண்ணெய்', 'oil': 'எண்ணெய்',
  'milk': 'பால்', 'cream': 'கிரீம்', 'yogurt': 'தயிர்',
  'curd': 'தயிர்', 'yogurt / curd': 'தயிர்', 'coconut milk': 'தேங்காய் பால்',
  // Pastes & Others
  'ginger': 'இஞ்சி', 'garlic': 'பூண்டு',
  'ginger-garlic paste': 'இஞ்சி-பூண்டு விழுது',
  'tomato puree': 'தக்காளி விழுது', 'coconut': 'தேங்காய்',
  'tamarind': 'புளி', 'jaggery': 'வெல்லம்', 'sugar': 'சர்க்கரை',
  'honey': 'தேன்', 'vinegar': 'வினிகர்', 'lemon': 'எலுமிச்சை',
  'lemon juice': 'எலுமிச்சை சாறு', 'lime': 'எலுமிச்சை',
  'water': 'தண்ணீர்', 'cashew': 'முந்திரி', 'cashews': 'முந்திரி',
  'raisin': 'திராட்சை', 'raisins': 'திராட்சை', 'almond': 'பாதாம்',
  'almonds': 'பாதாம்', 'sesame': 'எள்', 'poppy seeds': 'கசகசா',
  'kasuri methi': 'காசூரி மேத்தி',
  // Cooking terms for steps
  'kashmiri red chili powder': 'காஷ்மீரி மிளகாய்த்தூள்',
  'kashmiri chili powder': 'காஷ்மீரி மிளகாய்த்தூள்',
  'idli rice': 'இட்லி அரிசி',
  'mixed vegetables': 'கலப்பு காய்கறிகள்',
  'whole spices': 'முழு மசாலா',
};

// Full-sentence Tamil translations for common cooking step patterns
const TAMIL_STEP_TRANSLATIONS: [RegExp, string][] = [
  // Rice preparation
  [/wash and soak basmati rice for (\d+) minutes\b.*?boil rice with whole spices.*?until (\d+)% cooked.*?drain and set aside/i,
    'பாஸ்மதி அரிசியை கழுவி $1 நிமிடம் ஊறவைக்கவும். முழு மசாலா (பிரிஞ்சி இலை, ஏலக்காய், பட்டை, கிராம்பு) சேர்த்து $2% வேகும் வரை கொதிக்கவிடவும். வடிகட்டி தனியே வைக்கவும்.'],
  // Marinate chicken
  [/marinate chicken with yogurt.*?ginger.?garlic paste.*?biryani masala.*?chili powder.*?turmeric.*?salt.*?lemon juice.*?mint.*?coriander.*?(\d+) minutes/i,
    'சிக்கனை தயிர், இஞ்சி-பூண்டு விழுது, பிரியாணி மசாலா, மிளகாய்த்தூள், மஞ்சள் தூள், உப்பு, எலுமிச்சை சாறு, பாதி புதினா மற்றும் கொத்தமல்லி இலைகள் சேர்த்து $1 நிமிடம் ஊறவைக்கவும்.'],
  // Fry onions
  [/heat oil and ghee.*?heavy.?bottomed pot.*?fry.*?onions until.*?golden brown.*?birista.*?remove half.*?garnish/i,
    'கனமான பாத்திரத்தில் எண்ணெய் மற்றும் நெய் சூடாக்கவும். வெங்காயத்தை அடர் பொன்னிறமாக (பிரிஸ்தா) வறுக்கவும். பாதியை கார்னிஷுக்காக எடுத்து வைக்கவும்.'],
  // Cook chicken
  [/add the marinated chicken.*?remaining onions.*?cook on high heat.*?(\d+) minutes.*?lower heat.*?cook until chicken.*?(\d+)%.*?(\d+) minutes/i,
    'ஊறவைத்த சிக்கனை மீதமுள்ள வெங்காயத்துடன் சேர்க்கவும். அதிக தீயில் $1 நிமிடம் வேகவைத்து, பின்னர் குறைந்த தீயில் சிக்கன் $2% வேகும் வரை (சுமார் $3 நிமிடம்) சமைக்கவும்.'],
  // Layer rice
  [/layer the partially cooked rice over the chicken.*?sprinkle fried onions.*?mint.*?coriander.*?saffron milk.*?ghee/i,
    'பகுதியாக வெந்த அரிசியை சிக்கன் மேல் அடுக்கவும். வறுத்த வெங்காயம், மீதமுள்ள புதினா, கொத்தமல்லி, குங்குமப்பூ பால், மற்றும் நெய் தூவி அலங்கரிக்கவும்.'],
  // Dum cooking
  [/cover with.*?tight.*?lid.*?seal.*?cook on high heat.*?(\d+).?(\d+) minutes.*?reduce.*?lowest heat.*?cook.*?dum.*?(\d+).?(\d+) minutes/i,
    'இறுக்கமான மூடியால் மூடி, அதிக தீயில் $1-$2 நிமிடம் வைத்து, பின்னர் மிகக் குறைந்த தீயில் (தம்) $3-$4 நிமிடம் வேகவிடவும்.'],
  // Rest and serve
  [/turn off heat.*?let it rest.*?(\d+) minutes.*?without opening.*?lid.*?gently mix.*?serve.*?raita.*?salan/i,
    'தீயை அணைத்து, மூடியைத் திறக்காமல் $1 நிமிடம் ஓய்வு கொடுக்கவும். மெதுவாக கலந்து, ரைத்தா மற்றும் சால்னா உடன் சூடாகப் பரிமாறவும்.'],
  // Generic cooking patterns
  [/heat oil in a pan.*?add curry leaves.*?sauté onions until golden/i,
    'ஒரு கடாயில் எண்ணெய் சூடாக்கி, கறிவேப்பிலை சேர்த்து, வெங்காயத்தை பொன்னிறமாக வதக்கவும்.'],
  [/add ginger.?garlic paste.*?green chil.*?cook until raw smell/i,
    'இஞ்சி-பூண்டு விழுது மற்றும் பச்சை மிளகாய் சேர்த்து, பச்சை வாசனை போகும் வரை வதக்கவும்.'],
  [/add tomatoes.*?turmeric.*?chili powder.*?coriander powder.*?cook until.*?mushy.*?oil separates/i,
    'தக்காளி, மஞ்சள் தூள், மிளகாய்த்தூள், தனியா தூள் சேர்த்து, தக்காளி குழைந்து எண்ணெய் பிரியும் வரை சமைக்கவும்.'],
  [/add chicken pieces.*?salt.*?mix well.*?cook on medium heat.*?(\d+) minutes/i,
    'சிக்கன் துண்டுகள் மற்றும் உப்பு சேர்த்து நன்கு கலக்கவும். நடுத்தர தீயில் $1 நிமிடம் சமைக்கவும்.'],
  [/add water.*?cover and cook until chicken is tender.*?add garam masala.*?garnish.*?coriander/i,
    'தேவையான தண்ணீர் சேர்த்து, மூடி போட்டு சிக்கன் நன்கு வேகும் வரை சமைக்கவும். கரம் மசாலா சேர்த்து, கொத்தமல்லி இலையால் அலங்கரித்துப் பரிமாறவும்.'],
  // Sambar patterns
  [/pressure cook.*?dal.*?turmeric.*?soft.*?mash/i,
    'பருப்பை மஞ்சள் தூள் சேர்த்து குக்கரில் மிருதுவாக வேகவைத்து மசிக்கவும்.'],
  [/cook vegetables.*?tamarind.*?sambar powder.*?tender/i,
    'காய்கறிகளை புளி தண்ணீர் மற்றும் சாம்பார் பொடி சேர்த்து மிருதுவாகும் வரை வேகவைக்கவும்.'],
  [/temper with mustard seeds.*?curry leaves.*?dried red chil/i,
    'கடுகு, கறிவேப்பிலை மற்றும் காய்ந்த மிளகாய் தாளிக்கவும்.'],
  // Dosa/Idli patterns
  [/soak rice.*?urad dal.*?(\d+).?(\d+) hours.*?grind.*?smooth batter.*?ferment overnight/i,
    'அரிசி மற்றும் உளுந்தை $1-$2 மணி நேரம் ஊறவைக்கவும். நைஸாக அரைத்து, இரவு முழுவதும் புளிக்க வைக்கவும்.'],
  [/add salt.*?fermented batter.*?heat.*?griddle.*?pour.*?batter/i,
    'புளித்த மாவில் உப்பு சேர்க்கவும். தோசைக்கல்லை சூடாக்கி, மாவை ஊற்றவும்.'],
  [/spread batter.*?circular.*?thin dosa.*?drizzle oil.*?edges/i,
    'மாவை வட்டமாக பரப்பி, மெல்லிய தோசையாக ஊற்றவும். ஓரங்களில் எண்ணெய் விடவும்.'],
  [/cook until golden.*?crispy.*?serve with.*?coconut chutney.*?sambar/i,
    'பொன்னிறமாக மொறுமொறுப்பாக சுடவும். தேங்காய் சட்னி மற்றும் சாம்பார் உடன் பரிமாறவும்.'],
  // Paneer / Butter chicken patterns
  [/sauté onions.*?cashews.*?butter.*?soft.*?add tomato puree.*?cook.*?(\d+) minutes.*?blend.*?smooth/i,
    'வெங்காயம் மற்றும் முந்திரியை வெண்ணெயில் மிருதுவாக வதக்கவும். தக்காளி விழுது சேர்த்து $1 நிமிடம் சமைத்து, நைஸாக அரைக்கவும்.'],
  [/melt butter.*?sauté onion.*?ginger.?garlic paste.*?add tomato puree.*?cook.*?(\d+) minutes.*?oil separates/i,
    'வெண்ணெயை உருக்கி, வெங்காயம் மற்றும் இஞ்சி-பூண்டு விழுது வதக்கவும். தக்காளி விழுது சேர்த்து $1 நிமிடம் எண்ணெய் பிரியும் வரை சமைக்கவும்.'],
  // Fallback generic patterns
  [/serve hot with (.*)/i, '$1 உடன் சூடாகப் பரிமாறவும்.'],
  [/garnish with (.*)/i, '$1 கொண்டு அலங்கரிக்கவும்.'],
];

/**
 * Translate an ingredient name to Tamil using dictionary lookup
 */
function translateToTamil(text: string): string {
  const lower = text.toLowerCase().trim();
  // Exact match first
  if (TAMIL_DICT[lower]) return TAMIL_DICT[lower];
  // Try partial matches — find longest matching key
  const sortedEntries = Object.entries(TAMIL_DICT).sort((a, b) => b[0].length - a[0].length);
  let result = text;
  for (const [eng, tam] of sortedEntries) {
    const regex = new RegExp(`\\b${eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    result = result.replace(regex, tam);
  }
  return result;
}

/**
 * Translate a cooking step to Tamil using pattern matching.
 * Tries full-sentence matches first, falls back to word-by-word.
 */
function translateStepToTamil(text: string): string {
  // Try full-sentence pattern matches first
  for (const [pattern, replacement] of TAMIL_STEP_TRANSLATIONS) {
    if (pattern.test(text)) {
      return text.replace(pattern, replacement);
    }
  }

  // Fallback: word-by-word replacement using the ingredient dictionary
  // Sort by length (longest first) to avoid partial replacements
  const sortedEntries = Object.entries(TAMIL_DICT).sort((a, b) => b[0].length - a[0].length);
  let result = text;
  for (const [eng, tam] of sortedEntries) {
    const regex = new RegExp(`\\b${eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    result = result.replace(regex, tam);
  }

  // Also translate common English words
  const commonWords: [RegExp, string][] = [
    [/\bwash\b/gi, 'கழுவு'], [/\bsoak\b/gi, 'ஊறவை'], [/\bboil\b/gi, 'கொதிக்கவை'],
    [/\bcook\b/gi, 'சமை'], [/\bcooked\b/gi, 'வெந்த'], [/\bcooking\b/gi, 'சமையல்'],
    [/\bfry\b/gi, 'வறு'], [/\bfried\b/gi, 'வறுத்த'], [/\bheat\b/gi, 'சூடாக்கு'],
    [/\badd\b/gi, 'சேர்'], [/\bmix\b/gi, 'கலக்கு'], [/\bstir\b/gi, 'கிளறு'],
    [/\bserve\b/gi, 'பரிமாறு'], [/\bmarinate\b/gi, 'ஊறவை'], [/\bmarinated\b/gi, 'ஊறவைத்த'],
    [/\bgrind\b/gi, 'அரை'], [/\bchop\b/gi, 'நறுக்கு'], [/\bsliced\b/gi, 'நறுக்கிய'],
    [/\bcut\b/gi, 'வெட்டு'], [/\bpeel\b/gi, 'தோலுரி'], [/\bdrain\b/gi, 'வடிகட்டு'],
    [/\bgarnish\b/gi, 'அலங்கரி'], [/\bcover\b/gi, 'மூடு'], [/\bremove\b/gi, 'எடு'],
    [/\bsprinkle\b/gi, 'தூவு'], [/\blayer\b/gi, 'அடுக்கு'], [/\bblend\b/gi, 'அரை'],
    [/\bsimmer\b/gi, 'மிதமான தீயில் வை'], [/\bsteam\b/gi, 'ஆவியில் வேகவை'],
    [/\bpressure cook\b/gi, 'குக்கரில் வேகவை'], [/\bpour\b/gi, 'ஊற்று'],
    [/\bset aside\b/gi, 'ஒதுக்கி வைக்கவும்'], [/\band\b/gi, 'மற்றும்'],
    [/\bwith\b/gi, 'உடன்'], [/\buntil\b/gi, 'வரை'], [/\bthe\b/gi, ''],
    [/\bminutes\b/gi, 'நிமிடம்'], [/\bhot\b/gi, 'சூடாக'],
    [/\bhigh heat\b/gi, 'அதிக தீயில்'], [/\blow heat\b/gi, 'குறைந்த தீயில்'],
    [/\bmedium heat\b/gi, 'நடுத்தர தீயில்'], [/\bfor\b/gi, ''],
    [/\bin a\b/gi, 'ஒரு'], [/\bover\b/gi, 'மேல்'], [/\bon top\b/gi, 'மேலே'],
    [/\bremaining\b/gi, 'மீதமுள்ள'], [/\bhalf\b/gi, 'பாதி'],
    [/\bgently\b/gi, 'மெதுவாக'], [/\bhour\b/gi, 'மணி நேரம்'],
    [/\brest\b/gi, 'ஓய்வு'], [/\btender\b/gi, 'மிருதுவாக'],
    [/\bsoft\b/gi, 'மிருது'], [/\bgolden brown\b/gi, 'பொன்னிறமாக'],
    [/\bdeep golden brown\b/gi, 'அடர் பொன்னிறமாக'],
    [/\bpartially\b/gi, 'பகுதியாக'],
  ];

  for (const [pattern, replacement] of commonWords) {
    result = result.replace(pattern, replacement);
  }

  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Generates a styled HTML recipe document and opens the browser print dialog
 * (Save as PDF). Supports Tamil Unicode via Google's Noto Sans Tamil font.
 */
export function downloadRecipePDF(recipe: Recipe, language: PDFLanguage = 'en') {
  const isEn = language === 'en';

  // Name: use Tamil name if available, otherwise translate
  const getName = () => {
    if (isEn) return recipe.name;
    return recipe.nameInTamil || translateToTamil(recipe.name);
  };

  // Ingredient name: use Tamil if available, otherwise translate
  const getIngName = (ing: typeof recipe.ingredients[0]) => {
    if (isEn) return ing.name;
    return ing.nameInTamil || translateToTamil(ing.name);
  };

  // Step text: use Tamil if available, otherwise translate
  const getStepText = (step: typeof recipe.instructions[0]) => {
    if (isEn) return step.text;
    return step.textInTamil || translateStepToTamil(step.text);
  };

  const ingredientsHTML = recipe.ingredients.map(ing => {
    const opt = ing.isOptional ? ' <span style="color:#999;font-size:12px">(optional)</span>' : '';
    return `<li style="padding:4px 0;border-bottom:1px solid #f0f0f0">
      <strong>${getIngName(ing)}</strong> — ${ing.quantity} ${ing.unit}${opt}
    </li>`;
  }).join('');

  const stepsHTML = recipe.instructions.map(step => `
    <li style="padding:6px 0;margin-bottom:4px">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="min-width:24px;height:24px;border-radius:50%;background:#10b981;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;flex-shrink:0">${step.stepNumber}</span>
        <div>
          <span>${getStepText(step)}</span>
          ${step.durationMinutes ? `<span style="color:#999;font-size:12px;margin-left:6px">(${step.durationMinutes} min)</span>` : ''}
        </div>
      </div>
    </li>
  `).join('');

  const tagsHTML = [...recipe.tags, ...recipe.healthTags.map(h => h.replace(/_/g, ' '))].map(
    t => `<span style="display:inline-block;padding:2px 10px;border-radius:20px;background:#ecfdf5;color:#059669;font-size:11px;font-weight:600;margin:2px">${t}</span>`
  ).join('');

  const nutritionHTML = recipe.nutritionPer100g.calories > 0 ? `
    <div style="margin-top:20px">
      <h3 style="color:#333;font-size:15px;margin-bottom:8px;border-bottom:2px solid #10b981;padding-bottom:4px">
        ${isEn ? 'Nutrition (per 100g)' : 'ஊட்டச்சத்து (100g க்கு)'}
      </h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr style="background:#f9fafb">
          <td style="padding:6px 10px;border:1px solid #e5e7eb"><strong>${isEn ? 'Calories' : 'கலோரிகள்'}</strong></td>
          <td style="padding:6px 10px;border:1px solid #e5e7eb">${recipe.nutritionPer100g.calories} kcal</td>
          <td style="padding:6px 10px;border:1px solid #e5e7eb"><strong>${isEn ? 'Protein' : 'புரதம்'}</strong></td>
          <td style="padding:6px 10px;border:1px solid #e5e7eb">${recipe.nutritionPer100g.protein}g</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;border:1px solid #e5e7eb"><strong>${isEn ? 'Carbs' : 'கார்போஹைட்ரேட்'}</strong></td>
          <td style="padding:6px 10px;border:1px solid #e5e7eb">${recipe.nutritionPer100g.carbs}g</td>
          <td style="padding:6px 10px;border:1px solid #e5e7eb"><strong>${isEn ? 'Fat' : 'கொழுப்பு'}</strong></td>
          <td style="padding:6px 10px;border:1px solid #e5e7eb">${recipe.nutritionPer100g.fat}g</td>
        </tr>
        <tr style="background:#f9fafb">
          <td style="padding:6px 10px;border:1px solid #e5e7eb"><strong>${isEn ? 'Fiber' : 'நார்ச்சத்து'}</strong></td>
          <td style="padding:6px 10px;border:1px solid #e5e7eb">${recipe.nutritionPer100g.fiber}g</td>
          <td style="padding:6px 10px;border:1px solid #e5e7eb"><strong>${isEn ? 'Iron' : 'இரும்புச்சத்து'}</strong></td>
          <td style="padding:6px 10px;border:1px solid #e5e7eb">${recipe.nutritionPer100g.iron}mg</td>
        </tr>
      </table>
    </div>
  ` : '';

  const videoHTML = recipe.videoLinks && recipe.videoLinks.length > 0 ? `
    <div style="margin-top:20px">
      <h3 style="color:#333;font-size:15px;margin-bottom:8px;border-bottom:2px solid #10b981;padding-bottom:4px">
        ${isEn ? 'Video Links' : 'வீடியோ இணைப்புகள்'}
      </h3>
      ${recipe.videoLinks.map(v => {
        const icon = v.platform === 'youtube' ? '▶ YouTube' : '◉ Instagram';
        const lang = v.originalLanguage === 'en' ? 'English' : v.originalLanguage === 'ta' ? 'Tamil' : 'Hindi';
        return `<div style="padding:6px 0;font-size:13px">
          <span style="color:${v.platform === 'youtube' ? '#ef4444' : '#ec4899'};font-weight:600">${icon}</span>
          <span style="color:#666;margin:0 6px">(${lang})</span>
          <a href="${v.url}" style="color:#3b82f6">${v.url}</a>
        </div>`;
      }).join('')}
    </div>
  ` : '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${getName()} — NutriMom Recipe</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', 'Noto Sans Tamil', sans-serif;
      color: #333;
      max-width: 700px;
      margin: 0 auto;
      padding: 0 20px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#10b981,#0d9488);padding:20px 24px;color:#fff;margin:0 -20px">
    <h1 style="font-size:18px;font-weight:700;margin-bottom:2px">NutriMom</h1>
    <p style="font-size:11px;opacity:0.85">${isEn ? 'Healthy Meal Planner' : 'ஆரோக்கிய உணவு திட்டமிடல்'}</p>
  </div>

  <div style="padding:24px 0">
    <!-- Recipe Title -->
    <h2 style="font-size:22px;font-weight:700;color:#1a1a1a;margin-bottom:4px">${getName()}</h2>
    ${!isEn && recipe.name !== getName() ? `<p style="font-size:14px;color:#888;margin-bottom:8px">${recipe.name}</p>` : ''}

    <!-- Meta -->
    <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:#666;margin:10px 0">
      <span>🍽️ ${recipe.cuisineName || recipe.cuisineId}</span>
      <span>⏱️ ${isEn ? 'Prep' : 'தயாரிப்பு'}: ${recipe.prepTimeMinutes}m</span>
      <span>🔥 ${isEn ? 'Cook' : 'சமையல்'}: ${recipe.cookTimeMinutes}m</span>
      <span>⏰ ${isEn ? 'Total' : 'மொத்தம்'}: ${recipe.prepTimeMinutes + recipe.cookTimeMinutes}m</span>
      <span>🍴 ${isEn ? 'Servings' : 'பரிமாறல்'}: ${recipe.servings}</span>
    </div>

    <!-- Tags -->
    ${tagsHTML ? `<div style="margin:10px 0">${tagsHTML}</div>` : ''}

    <!-- Ingredients -->
    <div style="margin-top:20px">
      <h3 style="color:#333;font-size:15px;margin-bottom:8px;border-bottom:2px solid #10b981;padding-bottom:4px">
        ${isEn ? 'Ingredients' : 'பொருட்கள்'}
      </h3>
      <ul style="list-style:none;padding:0">${ingredientsHTML}</ul>
    </div>

    <!-- Steps -->
    <div style="margin-top:20px">
      <h3 style="color:#333;font-size:15px;margin-bottom:8px;border-bottom:2px solid #10b981;padding-bottom:4px">
        ${isEn ? 'Cooking Steps' : 'சமையல் படிகள்'}
      </h3>
      <ol style="list-style:none;padding:0">${stepsHTML}</ol>
    </div>

    ${nutritionHTML}
    ${videoHTML}

    <!-- Footer -->
    <div style="margin-top:30px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:10px;color:#aaa;display:flex;justify-content:space-between">
      <span>NutriMom — ${isEn ? 'Generated' : 'உருவாக்கப்பட்டது'} ${new Date().toLocaleDateString()}</span>
      <span>${isEn ? 'Language: English' : 'மொழி: தமிழ்'}</span>
    </div>
  </div>

  <!-- Print button (hidden when printing) -->
  <div class="no-print" style="text-align:center;padding:20px;position:sticky;bottom:0;background:#fff;border-top:1px solid #eee">
    <button onclick="window.print()" style="padding:12px 40px;border-radius:12px;border:none;background:linear-gradient(135deg,#10b981,#0d9488);color:#fff;font-size:14px;font-weight:600;cursor:pointer">
      📥 ${isEn ? 'Save as PDF' : 'PDF ஆக சேமி'}
    </button>
    <p style="font-size:11px;color:#999;margin-top:8px">${isEn ? 'Use "Save as PDF" in the print dialog' : 'Print உரையாடலில் "Save as PDF" என்பதைத் தேர்ந்தெடுக்கவும்'}</p>
  </div>
</body>
</html>`;

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 500);
    };
  }
}
