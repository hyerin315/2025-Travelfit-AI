export type TargetAudienceOption = {
  value: string;
  label: string;
  persona: string;
  ageGroup: string;
  expression?: string;
};

export type TravelThemeOption = {
  value: string;
  label: string;
  prompt: string;
  timeOfDay: string;
};

export type BrandStyleOption = {
  value: string;
  label: string;
  description: string;
  toneManner: string;
  imagePath: string;
};

export type LayoutOption = {
  value: 'center' | 'left' | 'right' | 'bottom';
  label: string;
  helper: string;
};

export type RatioOption = {
  value: string;
  label: string;
  helper: string;
};

export const TARGET_AUDIENCE_OPTIONS: TargetAudienceOption[] = [
  {
    value: 'honeymooners',
    label: 'Honeymooners',
    persona: '2_couple',
    ageGroup: '20s_30s',
    expression: 'smiling softly',
  },
  {
    value: 'families',
    label: 'Families with Kids',
    persona: '3_family',
    ageGroup: '20s_30s',
    expression: 'joyful expression',
  },
  {
    value: 'solo',
    label: 'Solo Travelers',
    persona: '1_female',
    ageGroup: '20s_30s',
    expression: 'curious expression',
  },
  {
    value: 'seniors',
    label: 'Seniors & Retirees',
    persona: '2_couple',
    ageGroup: 'senior',
    expression: 'relaxed expression',
  },
  {
    value: 'young_adults',
    label: 'Young Adults / Gen-Z',
    persona: '2_friends',
    ageGroup: '20s_30s',
    expression: 'energetic smile',
  },
];

export const TRAVEL_THEME_OPTIONS: TravelThemeOption[] = [
  {
    value: 'romantic_getaway',
    label: 'Romantic Getaway',
    prompt: 'sharing a romantic sunset stroll with warm gestures',
    timeOfDay: 'golden_hour',
  },
  {
    value: 'adventure_exploration',
    label: 'Adventure & Exploration',
    prompt: 'hiking through scenic trails, capturing candid motion',
    timeOfDay: 'afternoon',
  },
  {
    value: 'relaxation_wellness',
    label: 'Relaxation & Wellness',
    prompt: 'enjoying a serene spa moment with soft natural light',
    timeOfDay: 'morning',
  },
  {
    value: 'cultural_discovery',
    label: 'Cultural Discovery',
    prompt: 'immersed in local heritage spots, appreciating details',
    timeOfDay: 'afternoon',
  },
  {
    value: 'food_wine',
    label: 'Food & Wine Journey',
    prompt: 'sharing gourmet bites and drinks in a lively market',
    timeOfDay: 'night',
  },
];

export const BRAND_STYLE_OPTIONS: BrandStyleOption[] = [
  {
    value: 'vibrant_energetic',
    label: 'Vibrant & Energetic',
    description: 'High saturation, dynamic composition, cinematic lighting.',
    toneManner: 'vibrant_energetic',
    imagePath: '/assets/vibrant-energetic.svg',
  },
  {
    value: 'awe_inspiring_nature',
    label: 'Awe-Inspiring Nature',
    description: 'Sharp details, rich colors, dramatic documentary style.',
    toneManner: 'awe_inspiring_nature',
    imagePath: '/assets/awe-inspiring-nature.svg',
  },
  {
    value: 'warm_life_snap',
    label: 'Warm Life Snap',
    description: 'Cozy daylight, shallow depth, warm inviting mood.',
    toneManner: 'warm_life_snap',
    imagePath: '/assets/warm-life-snap.svg',
  },
  {
    value: 'minimalist_city_snap',
    label: 'Minimalist City Snap',
    description: 'Minimalist geometry, clean composition, low contrast.',
    toneManner: 'minimalist_city_snap',
    imagePath: '/assets/minimalist-city-snap.svg',
  },
  {
    value: 'vintage_film_look',
    label: 'Vintage Film Look',
    description: 'Film grain, light leaks, analog grading, moody feel.',
    toneManner: 'vintage_film_look',
    imagePath: '/assets/vintage-film-look.svg',
  },
];

export const COPY_LAYOUT_OPTIONS: LayoutOption[] = [
  { value: 'center', label: 'Center', helper: 'Balanced focus for hero copy' },
  { value: 'left', label: 'Subject Left', helper: 'Space for copy on the right' },
  { value: 'right', label: 'Subject Right', helper: 'Space for copy on the left' },
  { value: 'bottom', label: 'Bottom Space', helper: 'Room for heading at the top' },
];

export const RATIO_OPTIONS: RatioOption[] = [
  { value: '1:1', label: '1:1',helper: 'Instagram & paid social' },
  { value: '16:9', label: '16:9', helper: 'Web hero & video ads' },
  { value: '9:16', label: '9:16', helper: 'Reels & stories' },
  { value: '4:5', label: '4:5', helper: 'Feed & print' },
];

export const TOP_DESTINATIONS = [
  'Paris',
  'Seoul',
  'Tokyo',
  'New York',
  'Bangkok',
  'Bali',
  'Jeju',
  'Sydney',
  'Barcelona',
  'Lisbon',
];

const SPOT_ENTRIES = [
  { city: 'paris', spots: ['Eiffel Tower', 'Montmartre', 'Louvre Garden'] },
  { city: 'seoul', spots: ['Bukchon Hanok Village', 'Gyeongbokgung', 'Seoul Forest'] },
  { city: 'tokyo', spots: ['Shibuya Crossing', 'Senso-ji', 'TeamLab Borderless'] },
  { city: 'bali', spots: ['Uluwatu Cliff', 'Tegallalang Rice Terrace', 'Nusa Penida'] },
  { city: 'bangkok', spots: ['Grand Palace', 'Chatuchak Market', 'Chao Phraya River'] },
  { city: 'jeju', spots: ['Seongsan Sunrise Peak', 'Canola Field', 'Seogwipo Coast'] },
  { city: 'new york', spots: ['Brooklyn Bridge', 'Central Park', 'SoHo Rooftop'] },
  { city: 'lisbon', spots: ['Alfama Hills', 'LX Factory', 'Praça do Comércio'] },
];

export const DESTINATION_SPOTS: Record<string, string[]> = SPOT_ENTRIES.reduce((acc, entry) => {
  acc[entry.city] = entry.spots;
  return acc;
}, {} as Record<string, string[]>);

export const normalizeCityKey = (value: string) => value.trim().toLowerCase();


