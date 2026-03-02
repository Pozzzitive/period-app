export type CyclePhase =
  | 'menstruation'
  | 'follicular'
  | 'ovulation'
  | 'luteal'
  | 'premenstrual';

export interface PhaseDefinition {
  id: CyclePhase;
  label: string;
  color: string;
  lightColor: string;
  description: string;
  typicalDays: string;
  tips: string;
}

export const PHASES: Record<CyclePhase, PhaseDefinition> = {
  menstruation: {
    id: 'menstruation',
    label: 'Menstruation',
    color: '#D4738C',
    lightColor: '#F5E0E6',
    description: 'Active bleeding. The uterine lining sheds. Common symptoms include cramps, fatigue, bloating, and mood changes.',
    typicalDays: 'Days 1-5',
    tips: 'Rest when you need to. Stay hydrated and consider iron-rich foods.',
  },
  follicular: {
    id: 'follicular',
    label: 'Follicular Phase',
    color: '#6BAF9A',
    lightColor: '#DFF0EA',
    description: 'Estrogen rises as your body prepares an egg for release. Energy and mood typically improve.',
    typicalDays: 'Days 6-13',
    tips: 'Great time for new projects and physical activity. Energy levels tend to be higher.',
  },
  ovulation: {
    id: 'ovulation',
    label: 'Ovulation',
    color: '#A888C4',
    lightColor: '#EDE0F4',
    description: 'An egg is released from the ovary. This is the most fertile window.',
    typicalDays: 'Days 13-15',
    tips: 'You may notice increased energy and clear, stretchy cervical mucus.',
  },
  luteal: {
    id: 'luteal',
    label: 'Luteal Phase',
    color: '#D4A06E',
    lightColor: '#F6E8D8',
    description: 'Progesterone rises to prepare the uterus. If no pregnancy occurs, hormone levels drop.',
    typicalDays: 'Days 15-22',
    tips: 'You may start feeling more introspective. Prioritize self-care.',
  },
  premenstrual: {
    id: 'premenstrual',
    label: 'Premenstrual (PMS)',
    color: '#7E9BC4',
    lightColor: '#DEE8F4',
    description: 'The tail end of the luteal phase. PMS symptoms like mood swings, bloating, and cravings are common.',
    typicalDays: 'Days 23-28',
    tips: 'Be gentle with yourself. Warm baths, gentle exercise, and comfort foods can help.',
  },
};

export const PHASE_ORDER: CyclePhase[] = [
  'menstruation',
  'follicular',
  'ovulation',
  'luteal',
  'premenstrual',
];

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;
export const MIN_CYCLE_LENGTH = 21;
export const MAX_CYCLE_LENGTH = 45;
export const MIN_PERIOD_LENGTH = 2;
export const MAX_PERIOD_LENGTH = 10;
