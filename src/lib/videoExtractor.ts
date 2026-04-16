/**
 * YouTube Video Recipe Extractor
 *
 * Strategy:
 * 1. Get video title/metadata via oEmbed API (no CORS issues)
 * 2. Try to fetch YouTube page via Vite proxy to get captions
 * 3. If captions available → parse transcript into recipe
 * 4. If no captions → match video title against recipe template DB
 * 5. Pre-fill RecipeForm with extracted/matched data
 */

export interface ExtractedRecipe {
  title: string;
  titleTamil: string;
  thumbnailUrl: string;
  channelName: string;
  ingredients: { name: string; quantity: string; unit: string }[];
  steps: { stepNumber: number; text: string }[];
  videoUrl: string;
  platform: 'youtube' | 'instagram';
  language: string;
  rawTranscript: string;
}

// ── Recipe Template Database ──────────────────────────────────────
// Common Indian recipes with standard ingredients and steps
const RECIPE_TEMPLATES: Record<string, {
  keywords: string[];
  ingredients: { name: string; quantity: string; unit: string }[];
  steps: { stepNumber: number; text: string }[];
}> = {
  'chicken_biryani': {
    keywords: ['biryani', 'biriyani', 'dum biryani', 'chicken biryani', 'chicken biriyani', 'kalyana biriyani'],
    ingredients: [
      { name: 'Chicken', quantity: '500', unit: 'gm' },
      { name: 'Basmati Rice', quantity: '2', unit: 'cups' },
      { name: 'Onions (sliced)', quantity: '3', unit: 'large' },
      { name: 'Tomatoes', quantity: '2', unit: 'medium' },
      { name: 'Yogurt / Curd', quantity: '1', unit: 'cup' },
      { name: 'Ginger-Garlic Paste', quantity: '2', unit: 'tbsp' },
      { name: 'Green Chilies', quantity: '4', unit: 'nos' },
      { name: 'Mint Leaves', quantity: '1', unit: 'bunch' },
      { name: 'Coriander Leaves', quantity: '1', unit: 'bunch' },
      { name: 'Biryani Masala', quantity: '2', unit: 'tbsp' },
      { name: 'Red Chili Powder', quantity: '1', unit: 'tsp' },
      { name: 'Turmeric Powder', quantity: '0.5', unit: 'tsp' },
      { name: 'Garam Masala', quantity: '1', unit: 'tsp' },
      { name: 'Ghee', quantity: '3', unit: 'tbsp' },
      { name: 'Oil', quantity: '3', unit: 'tbsp' },
      { name: 'Bay Leaves', quantity: '2', unit: 'nos' },
      { name: 'Cardamom', quantity: '4', unit: 'nos' },
      { name: 'Cinnamon Stick', quantity: '1', unit: 'inch' },
      { name: 'Cloves', quantity: '4', unit: 'nos' },
      { name: 'Star Anise', quantity: '1', unit: 'nos' },
      { name: 'Saffron (in warm milk)', quantity: '1', unit: 'pinch' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
      { name: 'Lemon Juice', quantity: '1', unit: 'tbsp' },
    ],
    steps: [
      { stepNumber: 1, text: 'Wash and soak basmati rice for 30 minutes. Boil rice with whole spices (bay leaf, cardamom, cinnamon, cloves) until 70% cooked. Drain and set aside.' },
      { stepNumber: 2, text: 'Marinate chicken with yogurt, ginger-garlic paste, biryani masala, chili powder, turmeric, salt, lemon juice, and half the mint and coriander leaves. Let it rest for 30 minutes.' },
      { stepNumber: 3, text: 'Heat oil and ghee in a heavy-bottomed pot. Fry sliced onions until deep golden brown (birista). Remove half and set aside for garnish.' },
      { stepNumber: 4, text: 'Add the marinated chicken to the remaining onions. Cook on high heat for 5 minutes, then lower heat and cook until chicken is 80% done (about 10 minutes).' },
      { stepNumber: 5, text: 'Layer the partially cooked rice over the chicken. Sprinkle fried onions, remaining mint and coriander leaves, saffron milk, and ghee on top.' },
      { stepNumber: 6, text: 'Cover with a tight-fitting lid or seal with dough. Cook on high heat for 3-4 minutes, then reduce to the lowest heat and cook (dum) for 25-30 minutes.' },
      { stepNumber: 7, text: 'Turn off heat and let it rest for 5 minutes without opening the lid. Gently mix before serving. Serve hot with raita and salan.' },
    ],
  },
  'mutton_biryani': {
    keywords: ['mutton biryani', 'mutton biriyani', 'goat biryani', 'lamb biryani'],
    ingredients: [
      { name: 'Mutton', quantity: '500', unit: 'gm' },
      { name: 'Basmati Rice', quantity: '2', unit: 'cups' },
      { name: 'Onions (sliced)', quantity: '4', unit: 'large' },
      { name: 'Tomatoes', quantity: '2', unit: 'medium' },
      { name: 'Yogurt / Curd', quantity: '1', unit: 'cup' },
      { name: 'Ginger-Garlic Paste', quantity: '2', unit: 'tbsp' },
      { name: 'Green Chilies', quantity: '5', unit: 'nos' },
      { name: 'Mint Leaves', quantity: '1', unit: 'bunch' },
      { name: 'Coriander Leaves', quantity: '1', unit: 'bunch' },
      { name: 'Biryani Masala', quantity: '2', unit: 'tbsp' },
      { name: 'Ghee', quantity: '4', unit: 'tbsp' },
      { name: 'Oil', quantity: '3', unit: 'tbsp' },
      { name: 'Whole Spices (bay, cardamom, cinnamon, cloves, star anise)', quantity: 'as needed', unit: '' },
      { name: 'Saffron in warm milk', quantity: '1', unit: 'pinch' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Wash and soak basmati rice for 30 minutes. Pressure cook mutton with salt and whole spices until 70% done.' },
      { stepNumber: 2, text: 'Marinate mutton with yogurt, ginger-garlic paste, biryani masala, chili powder, and salt for at least 1 hour.' },
      { stepNumber: 3, text: 'Fry sliced onions until deep golden brown. Remove half for garnish. Cook marinated mutton with the remaining onions.' },
      { stepNumber: 4, text: 'Layer parboiled rice over the mutton. Add fried onions, mint, coriander, saffron milk, and ghee.' },
      { stepNumber: 5, text: 'Seal and cook on dum (lowest heat) for 40-45 minutes. Rest for 5 minutes, gently mix, and serve.' },
    ],
  },
  'butter_chicken': {
    keywords: ['butter chicken', 'murgh makhani', 'chicken makhani'],
    ingredients: [
      { name: 'Chicken (boneless)', quantity: '500', unit: 'gm' },
      { name: 'Butter', quantity: '4', unit: 'tbsp' },
      { name: 'Cream', quantity: '0.5', unit: 'cup' },
      { name: 'Tomato Puree', quantity: '2', unit: 'cups' },
      { name: 'Onion', quantity: '1', unit: 'large' },
      { name: 'Ginger-Garlic Paste', quantity: '1', unit: 'tbsp' },
      { name: 'Kashmiri Red Chili Powder', quantity: '1', unit: 'tbsp' },
      { name: 'Garam Masala', quantity: '1', unit: 'tsp' },
      { name: 'Dried Fenugreek Leaves (kasuri methi)', quantity: '1', unit: 'tsp' },
      { name: 'Sugar', quantity: '1', unit: 'tsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Marinate chicken with yogurt, ginger-garlic paste, chili powder, and salt for 30 minutes. Grill or pan-fry until charred.' },
      { stepNumber: 2, text: 'Melt butter in a pan. Sauté onion and ginger-garlic paste. Add tomato puree and cook for 15 minutes until oil separates.' },
      { stepNumber: 3, text: 'Blend the sauce smooth. Return to pan, add grilled chicken, cream, garam masala, kasuri methi, and sugar. Simmer for 10 minutes.' },
      { stepNumber: 4, text: 'Finish with a swirl of butter and cream. Serve hot with naan or jeera rice.' },
    ],
  },
  'chicken_curry': {
    keywords: ['chicken curry', 'chicken gravy', 'kozhi curry', 'kozhi kulambu', 'chicken masala'],
    ingredients: [
      { name: 'Chicken', quantity: '500', unit: 'gm' },
      { name: 'Onions', quantity: '2', unit: 'large' },
      { name: 'Tomatoes', quantity: '2', unit: 'medium' },
      { name: 'Ginger-Garlic Paste', quantity: '1.5', unit: 'tbsp' },
      { name: 'Green Chilies', quantity: '3', unit: 'nos' },
      { name: 'Curry Leaves', quantity: '10', unit: 'leaves' },
      { name: 'Turmeric Powder', quantity: '0.5', unit: 'tsp' },
      { name: 'Red Chili Powder', quantity: '1.5', unit: 'tsp' },
      { name: 'Coriander Powder', quantity: '2', unit: 'tsp' },
      { name: 'Garam Masala', quantity: '1', unit: 'tsp' },
      { name: 'Oil', quantity: '3', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
      { name: 'Coriander Leaves (for garnish)', quantity: 'as needed', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Heat oil in a pan. Add curry leaves and sauté onions until golden brown.' },
      { stepNumber: 2, text: 'Add ginger-garlic paste and green chilies. Cook until raw smell goes away.' },
      { stepNumber: 3, text: 'Add tomatoes, turmeric, chili powder, and coriander powder. Cook until tomatoes are mushy and oil separates.' },
      { stepNumber: 4, text: 'Add chicken pieces and salt. Mix well and cook on medium heat for 10 minutes.' },
      { stepNumber: 5, text: 'Add water as needed, cover and cook until chicken is tender (about 20 minutes). Add garam masala, garnish with coriander leaves and serve.' },
    ],
  },
  'sambar': {
    keywords: ['sambar', 'sambhar', 'sambar recipe'],
    ingredients: [
      { name: 'Toor Dal', quantity: '1', unit: 'cup' },
      { name: 'Mixed Vegetables (drumstick, carrot, brinjal)', quantity: '1.5', unit: 'cups' },
      { name: 'Tamarind', quantity: '1', unit: 'small piece' },
      { name: 'Sambar Powder', quantity: '2', unit: 'tbsp' },
      { name: 'Turmeric Powder', quantity: '0.5', unit: 'tsp' },
      { name: 'Mustard Seeds', quantity: '1', unit: 'tsp' },
      { name: 'Curry Leaves', quantity: '10', unit: 'leaves' },
      { name: 'Onion', quantity: '1', unit: 'medium' },
      { name: 'Oil', quantity: '2', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Pressure cook toor dal with turmeric until soft. Mash and set aside.' },
      { stepNumber: 2, text: 'Cook vegetables in tamarind water with sambar powder until tender.' },
      { stepNumber: 3, text: 'Add cooked dal to the vegetables. Simmer for 10 minutes.' },
      { stepNumber: 4, text: 'Temper with mustard seeds, curry leaves, and dried red chilies. Add to sambar and serve hot with rice.' },
    ],
  },
  'dosa': {
    keywords: ['dosa', 'dosai', 'crispy dosa', 'plain dosa', 'masala dosa'],
    ingredients: [
      { name: 'Rice', quantity: '3', unit: 'cups' },
      { name: 'Urad Dal', quantity: '1', unit: 'cup' },
      { name: 'Fenugreek Seeds', quantity: '1', unit: 'tsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
      { name: 'Oil', quantity: 'as needed', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Soak rice and urad dal separately for 4-6 hours. Grind to a smooth batter and ferment overnight.' },
      { stepNumber: 2, text: 'Add salt to fermented batter. Heat a flat griddle/tawa and pour a ladle of batter.' },
      { stepNumber: 3, text: 'Spread batter in circular motion to make thin dosa. Drizzle oil around edges.' },
      { stepNumber: 4, text: 'Cook until golden and crispy. Serve with coconut chutney and sambar.' },
    ],
  },
  'idli': {
    keywords: ['idli', 'idly', 'soft idli'],
    ingredients: [
      { name: 'Idli Rice', quantity: '2', unit: 'cups' },
      { name: 'Urad Dal', quantity: '1', unit: 'cup' },
      { name: 'Fenugreek Seeds', quantity: '0.5', unit: 'tsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Soak rice and urad dal separately for 4-6 hours. Grind urad dal first to fluffy batter, then grind rice.' },
      { stepNumber: 2, text: 'Mix both batters, add salt, and ferment overnight until doubled in volume.' },
      { stepNumber: 3, text: 'Grease idli moulds and pour batter. Steam for 12-15 minutes.' },
      { stepNumber: 4, text: 'Remove gently and serve hot with sambar and chutney.' },
    ],
  },
  'paneer_butter_masala': {
    keywords: ['paneer butter masala', 'paneer masala', 'paneer tikka masala', 'paneer curry'],
    ingredients: [
      { name: 'Paneer', quantity: '250', unit: 'gm' },
      { name: 'Butter', quantity: '3', unit: 'tbsp' },
      { name: 'Cream', quantity: '3', unit: 'tbsp' },
      { name: 'Tomato Puree', quantity: '1.5', unit: 'cups' },
      { name: 'Onion', quantity: '1', unit: 'large' },
      { name: 'Cashews', quantity: '10', unit: 'nos' },
      { name: 'Ginger-Garlic Paste', quantity: '1', unit: 'tbsp' },
      { name: 'Kashmiri Chili Powder', quantity: '1', unit: 'tsp' },
      { name: 'Garam Masala', quantity: '1', unit: 'tsp' },
      { name: 'Kasuri Methi', quantity: '1', unit: 'tsp' },
      { name: 'Sugar', quantity: '0.5', unit: 'tsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    steps: [
      { stepNumber: 1, text: 'Sauté onions and cashews in butter until soft. Add tomato puree and cook for 10 minutes. Blend to a smooth paste.' },
      { stepNumber: 2, text: 'Heat butter in a pan. Add ginger-garlic paste, then the blended gravy. Add chili powder and cook 5 minutes.' },
      { stepNumber: 3, text: 'Add paneer cubes, cream, garam masala, kasuri methi, sugar, and salt. Simmer for 5-7 minutes.' },
      { stepNumber: 4, text: 'Garnish with cream and coriander. Serve hot with naan or roti.' },
    ],
  },
};

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/**
 * Match a video title against recipe templates
 */
function matchRecipeTemplate(title: string): typeof RECIPE_TEMPLATES[string] | null {
  const lower = title.toLowerCase();
  for (const [, template] of Object.entries(RECIPE_TEMPLATES)) {
    for (const keyword of template.keywords) {
      if (lower.includes(keyword)) {
        return template;
      }
    }
  }
  return null;
}

/**
 * Fetch the YouTube watch page and try to extract captions
 */
async function tryExtractCaptions(videoId: string): Promise<{
  transcript: string;
  description: string;
  title: string;
}> {
  try {
    // Add &app=desktop to prevent YouTube from redirecting to m.youtube.com
    // Re-directs bypass the Vite proxy and cause CORS errors.
    const resp = await fetch(`/ytapi/watch?v=${videoId}&app=desktop`, {
      headers: { 'Accept-Language': 'en-US,en;q=0.9' },
    });
    if (!resp.ok) return { transcript: '', description: '', title: '' };

    const html = await resp.text();

    // Extract ytInitialPlayerResponse with proper bracket matching
    const idx = html.indexOf('ytInitialPlayerResponse');
    if (idx === -1) return { transcript: '', description: '', title: '' };

    const start = html.indexOf('{', idx);
    let depth = 0, end = start;
    for (let i = start; i < html.length; i++) {
      if (html[i] === '{') depth++;
      if (html[i] === '}') depth--;
      if (depth === 0) { end = i + 1; break; }
    }

    const data = JSON.parse(html.substring(start, end));
    const title = data?.videoDetails?.title || '';
    const description = data?.videoDetails?.shortDescription || '';

    // Try to get captions
    const captionTracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    let transcript = '';

    if (captionTracks.length > 0) {
      // Try English first, then translated, then original
      const enTrack = captionTracks.find((t: any) => t.languageCode?.startsWith('en'));

      if (enTrack) {
        transcript = await fetchCaptions(enTrack.baseUrl);
      } else {
        const first = captionTracks[0];
        transcript = await fetchCaptions(first.baseUrl, 'en') || await fetchCaptions(first.baseUrl);
      }
    }

    return { transcript, description, title };
  } catch (e) {
    console.warn('YouTube page extraction failed:', e);
    return { transcript: '', description: '', title: '' };
  }
}

async function fetchCaptions(baseUrl: string, translateLang?: string): Promise<string> {
  let url = baseUrl.replace('https://www.youtube.com', '/ytapi');
  if (translateLang) url += `&tlang=${translateLang}`;
  url += '&fmt=json3';

  try {
    const resp = await fetch(url);
    if (!resp.ok) return '';
    const data = await resp.json();
    if (data.events) {
      return data.events
        .filter((e: any) => e.segs)
        .map((e: any) => e.segs.map((s: any) => s.utf8 || '').join(''))
        .join(' ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  } catch { /* ignore */ }
  return '';
}

/**
 * Parse transcript text into ingredients + steps
 */
function parseTranscript(transcript: string, description: string): {
  ingredients: ExtractedRecipe['ingredients'];
  steps: ExtractedRecipe['steps'];
} {
  const ingredients: ExtractedRecipe['ingredients'] = [];
  const steps: ExtractedRecipe['steps'] = [];
  const seen = new Set<string>();
  const fullText = `${description}\n${transcript}`;

  const segments = fullText.split(/[.,\n]+/).map(s => s.trim()).filter(s => s.length > 3);

  const qtyPattern = /(\d+\.?\d*)\s*(cup|cups|tbsp|tsp|g|gm|kg|ml|piece|pcs|nos|whole|inch|pinch|bunch|clove|cloves|large|medium|small|handful|lb|oz|slice|slices|leaves|stick|sticks)s?\s+(?:of\s+)?(.+)/i;
  const foodWords = ['salt', 'pepper', 'oil', 'water', 'sugar', 'chicken', 'rice', 'onion', 'garlic', 'ginger', 'tomato', 'masala', 'ghee', 'curd', 'yogurt', 'mint', 'coriander', 'cumin', 'turmeric', 'chili', 'chilli', 'coconut', 'curry', 'paneer', 'butter', 'cream'];
  const actionWords = /^(first|then|next|add|mix|stir|heat|cook|boil|fry|roast|marinate|grind|blend|chop|wash|peel|drain|serve|garnish|cover|remove|pour|place|simmer|steam|grill)/i;

  let stepNum = 1;
  for (const seg of segments) {
    const lower = seg.toLowerCase();
    const qm = seg.match(qtyPattern);
    if (qm) {
      const name = qm[3].replace(/[,.\s]+$/, '').trim();
      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        ingredients.push({ name: name.charAt(0).toUpperCase() + name.slice(1), quantity: qm[1], unit: qm[2].toLowerCase() });
      }
    } else if (foodWords.some(f => lower.includes(f)) && seg.length < 50 && !actionWords.test(seg)) {
      const name = seg.replace(/[,.\s]+$/, '').trim();
      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        ingredients.push({ name: name.charAt(0).toUpperCase() + name.slice(1), quantity: 'as needed', unit: '' });
      }
    } else if (actionWords.test(seg) && seg.length > 15) {
      steps.push({ stepNumber: stepNum++, text: seg.charAt(0).toUpperCase() + seg.slice(1) });
    }
  }

  if (steps.length === 0 && transcript.length > 50) {
    transcript.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 10).forEach((t, i) => {
      steps.push({ stepNumber: i + 1, text: t.trim().charAt(0).toUpperCase() + t.trim().slice(1) });
    });
  }

  return { ingredients, steps };
}

/**
 * Main extraction function
 */
export async function extractRecipeFromVideo(
  url: string,
  videoLanguage: string = 'ta'
): Promise<{ success: boolean; recipe?: ExtractedRecipe; error?: string }> {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) return { success: false, error: 'Could not parse video ID from URL' };

    // 1. Get metadata from oEmbed
    let title = '';
    let thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    let channelName = '';

    try {
      const resp = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        const data = await resp.json();
        title = (data.title || '').replace(/[🥳🔥✅💯❤️😍🤤😋🎉👌💕]/g, '').trim();
        thumbnailUrl = data.thumbnail_url || thumbnailUrl;
        channelName = data.author_name || '';
      }
    } catch { /* ignore */ }

    // 2. Try to extract captions from YouTube page
    const pageData = await tryExtractCaptions(videoId);
    if (pageData.title && !title) title = pageData.title;

    let ingredients: ExtractedRecipe['ingredients'] = [];
    let steps: ExtractedRecipe['steps'] = [];
    let rawTranscript = pageData.transcript;

    // 3. If we got a transcript, parse it
    if (rawTranscript) {
      const parsed = parseTranscript(rawTranscript, pageData.description);
      ingredients = parsed.ingredients;
      steps = parsed.steps;
    }

    // 4. If no data from transcript, try recipe template matching
    if (ingredients.length === 0 && steps.length === 0) {
      const template = matchRecipeTemplate(title);
      if (template) {
        ingredients = [...template.ingredients];
        steps = [...template.steps];
        console.log(`Matched recipe template for: "${title}"`);
      }
    }

    // 5. Clean title — pick the most descriptive segment
    let cleanTitle = title;
    // Split by | and pick the longest/most descriptive segment
    const titleParts = title.split('|').map(p => p.trim());
    if (titleParts.length > 1) {
      // Pick the part that contains recipe-like words, otherwise the longest
      const recipePart = titleParts.find(p => 
        /biryani|biriyani|curry|masala|chicken|mutton|rice|dosa|idli|paneer|butter|sambar/i.test(p)
      );
      cleanTitle = recipePart || titleParts.reduce((a, b) => a.length > b.length ? a : b);
    }
    cleanTitle = cleanTitle
      .replace(/@\S+/g, '')
      .replace(/^(frequently asked recipe|recipe)\s*[:|]?\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      success: true,
      recipe: {
        title: cleanTitle || 'Untitled Recipe',
        titleTamil: '',
        thumbnailUrl,
        channelName,
        ingredients,
        steps,
        videoUrl: url,
        platform: 'youtube',
        language: videoLanguage,
        rawTranscript,
      },
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
