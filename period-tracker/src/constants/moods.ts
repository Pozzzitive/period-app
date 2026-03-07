export interface MoodDefinition {
  id: string;
  label: string;
  icon: string;
}

export const MOODS: MoodDefinition[] = [
  { id: 'happy', label: 'Happy', icon: '😊' },
  { id: 'calm', label: 'Calm', icon: '😌' },
  { id: 'energetic', label: 'Energetic', icon: '✨' },
  { id: 'sad', label: 'Sad', icon: '😢' },
  { id: 'anxious', label: 'Anxious', icon: '😰' },
  { id: 'irritable', label: 'Irritable', icon: '😤' },
  { id: 'mood_swings', label: 'Mood swings', icon: '🎭' },
  { id: 'sensitive', label: 'Sensitive', icon: '🥺' },
  { id: 'confident', label: 'Confident', icon: '💪' },
  { id: 'unmotivated', label: 'Unmotivated', icon: '😶' },
  { id: 'focused', label: 'Focused', icon: '🎯' },
  { id: 'emotional', label: 'Emotional', icon: '💝' },
];

export const MOODS_BY_ID: Record<string, MoodDefinition | undefined> = Object.fromEntries(
  MOODS.map((m) => [m.id, m])
);
