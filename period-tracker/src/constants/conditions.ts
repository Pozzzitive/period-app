export interface HealthCondition {
  id: string;
  label: string;
  description: string;
  insight: string;
  commonSymptoms: string[]; // symptom IDs
}

export const HEALTH_CONDITIONS: HealthCondition[] = [
  {
    id: 'pcos',
    label: 'Polycystic Ovary Syndrome (PCOS)',
    description: 'A hormonal disorder causing enlarged ovaries with small cysts.',
    insight: 'Users with PCOS often experience longer or irregular cycles. Your predictions may take more cycles to stabilize.',
    commonSymptoms: ['acne', 'oily_skin', 'hair_loss', 'weight_gain', 'bloating', 'pelvic_pain'],
  },
  {
    id: 'endometriosis',
    label: 'Endometriosis',
    description: 'Tissue similar to the uterine lining grows outside the uterus.',
    insight: 'Endometriosis can cause painful periods and heavier bleeding. Tracking your pain levels helps identify patterns.',
    commonSymptoms: ['cramps', 'pelvic_pain', 'painful_intercourse', 'heavy_bleeding', 'bloating', 'spotting', 'fatigue'],
  },
  {
    id: 'pmdd',
    label: 'Premenstrual Dysphoric Disorder (PMDD)',
    description: 'A severe form of PMS with significant mood symptoms.',
    insight: 'PMDD symptoms typically appear 1-2 weeks before your period. Tracking mood patterns can help you prepare.',
    commonSymptoms: ['mood_swings', 'fatigue', 'irritable', 'anxious', 'sad', 'food_cravings', 'insomnia'],
  },
  {
    id: 'fibroids',
    label: 'Uterine Fibroids',
    description: 'Non-cancerous growths in or on the uterus.',
    insight: 'Fibroids can cause heavier or longer periods. Tracking flow intensity helps monitor changes.',
    commonSymptoms: ['heavy_bleeding', 'cramps', 'pelvic_pain', 'spotting', 'bloating'],
  },
  {
    id: 'thyroid',
    label: 'Thyroid Disorder',
    description: 'Underactive or overactive thyroid affecting hormone levels.',
    insight: 'Thyroid conditions can make your cycles irregular. Consistent tracking helps you spot patterns.',
    commonSymptoms: ['fatigue', 'weight_gain', 'hair_loss', 'dry_skin', 'low_energy'],
  },
  {
    id: 'bleeding_disorders',
    label: 'Bleeding Disorder',
    description: 'Conditions affecting blood clotting.',
    insight: 'Bleeding disorders may cause heavier or longer periods. Tracking flow helps you share accurate info with your doctor.',
    commonSymptoms: ['heavy_bleeding', 'spotting'],
  },
];

export const CONDITIONS_BY_ID = Object.fromEntries(
  HEALTH_CONDITIONS.map((c) => [c.id, c])
) as Record<string, HealthCondition>;
