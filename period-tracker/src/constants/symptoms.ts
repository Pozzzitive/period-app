export interface SymptomDefinition {
  id: string;
  label: string;
  category: SymptomCategory;
  icon: string;
  conditionRelevant?: string[]; // health condition IDs where this symptom is especially relevant
}

export type SymptomCategory =
  | 'pain'
  | 'mood'
  | 'physical'
  | 'digestive'
  | 'skin'
  | 'sexual'
  | 'energy'
  | 'other'
  | 'custom';

export const SYMPTOM_CATEGORIES: Record<SymptomCategory, string> = {
  pain: 'Pain',
  mood: 'Mood & Emotions',
  physical: 'Physical',
  digestive: 'Digestive',
  skin: 'Skin & Hair',
  sexual: 'Sexual Health',
  energy: 'Energy & Sleep',
  other: 'Other',
  custom: 'Custom',
};

export const SYMPTOMS: SymptomDefinition[] = [
  // Pain
  { id: 'cramps', label: 'Cramps', category: 'pain', icon: '⚡', conditionRelevant: ['endometriosis', 'fibroids'] },
  { id: 'headache', label: 'Headache', category: 'pain', icon: '🤕' },
  { id: 'backache', label: 'Backache', category: 'pain', icon: '🔙' },
  { id: 'breast_tenderness', label: 'Breast tenderness', category: 'pain', icon: '💗' },
  { id: 'pelvic_pain', label: 'Pelvic pain', category: 'pain', icon: '🩹', conditionRelevant: ['endometriosis', 'pcos'] },
  { id: 'joint_pain', label: 'Joint pain', category: 'pain', icon: '🦴' },
  { id: 'migraine', label: 'Migraine', category: 'pain', icon: '🌀' },

  // Physical
  { id: 'bloating', label: 'Bloating', category: 'physical', icon: '🎈', conditionRelevant: ['pcos', 'endometriosis'] },
  { id: 'fatigue', label: 'Fatigue', category: 'physical', icon: '😴', conditionRelevant: ['thyroid', 'pmdd'] },
  { id: 'nausea', label: 'Nausea', category: 'physical', icon: '🤢' },
  { id: 'dizziness', label: 'Dizziness', category: 'physical', icon: '💫' },
  { id: 'hot_flashes', label: 'Hot flashes', category: 'physical', icon: '🔥' },
  { id: 'chills', label: 'Chills', category: 'physical', icon: '🥶' },
  { id: 'swelling', label: 'Swelling', category: 'physical', icon: '🫧' },
  { id: 'weight_gain', label: 'Weight gain', category: 'physical', icon: '⬆️', conditionRelevant: ['pcos', 'thyroid'] },

  // Digestive
  { id: 'constipation', label: 'Constipation', category: 'digestive', icon: '🚫' },
  { id: 'diarrhea', label: 'Diarrhea', category: 'digestive', icon: '💨' },
  { id: 'food_cravings', label: 'Food cravings', category: 'digestive', icon: '🍫' },
  { id: 'appetite_change', label: 'Appetite change', category: 'digestive', icon: '🍽️' },

  // Skin & Hair
  { id: 'acne', label: 'Acne', category: 'skin', icon: '🔴', conditionRelevant: ['pcos'] },
  { id: 'oily_skin', label: 'Oily skin', category: 'skin', icon: '✨', conditionRelevant: ['pcos'] },
  { id: 'dry_skin', label: 'Dry skin', category: 'skin', icon: '🏜️', conditionRelevant: ['thyroid'] },
  { id: 'hair_loss', label: 'Hair loss', category: 'skin', icon: '💇', conditionRelevant: ['pcos', 'thyroid'] },

  // Sexual Health
  { id: 'increased_libido', label: 'Increased libido', category: 'sexual', icon: '❤️‍🔥' },
  { id: 'decreased_libido', label: 'Decreased libido', category: 'sexual', icon: '💔' },
  { id: 'vaginal_dryness', label: 'Vaginal dryness', category: 'sexual', icon: '🫗' },
  { id: 'painful_intercourse', label: 'Painful intercourse', category: 'sexual', icon: '⚠️', conditionRelevant: ['endometriosis'] },

  // Energy & Sleep
  { id: 'insomnia', label: 'Insomnia', category: 'energy', icon: '🌙' },
  { id: 'oversleeping', label: 'Oversleeping', category: 'energy', icon: '💤' },
  { id: 'low_energy', label: 'Low energy', category: 'energy', icon: '🔋', conditionRelevant: ['thyroid'] },
  { id: 'high_energy', label: 'High energy', category: 'energy', icon: '🚀' },

  // Other
  { id: 'cervical_mucus_clear', label: 'Clear cervical mucus', category: 'other', icon: '💧' },
  { id: 'cervical_mucus_sticky', label: 'Sticky cervical mucus', category: 'other', icon: '🫠' },
  { id: 'spotting', label: 'Spotting', category: 'other', icon: '🩸', conditionRelevant: ['fibroids', 'endometriosis'] },
  { id: 'heavy_bleeding', label: 'Heavy bleeding', category: 'other', icon: '🩸🩸', conditionRelevant: ['fibroids', 'bleeding_disorders', 'endometriosis'] },
];

export const SYMPTOMS_BY_ID: Record<string, SymptomDefinition | undefined> = Object.fromEntries(
  SYMPTOMS.map((s) => [s.id, s])
);

export const SYMPTOMS_BY_CATEGORY = SYMPTOMS.reduce(
  (acc, symptom) => {
    if (!acc[symptom.category]) acc[symptom.category] = [];
    acc[symptom.category].push(symptom);
    return acc;
  },
  {} as Record<SymptomCategory, SymptomDefinition[]>
);
