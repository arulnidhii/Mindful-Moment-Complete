// Activity type for boosters and drainers
export type Activity = {
  id: string;
  name: string;
  emoji: string;
};

export const BOOSTERS: Activity[] = [
  { id: 'exercise', name: 'Exercise', emoji: '💪' },
  { id: 'sunshine', name: 'Sunshine', emoji: '☀️' },
  { id: 'nature', name: 'Nature', emoji: '🌳' },
  { id: 'meditation', name: 'Meditation', emoji: '🧘' },
  { id: 'social', name: 'Social Time', emoji: '🗣️' },
  { id: 'music', name: 'Music', emoji: '🎵' },
  { id: 'reading', name: 'Reading', emoji: '📚' },
  { id: 'hobby', name: 'Hobby', emoji: '🎨' },
  { id: 'healthy_food', name: 'Healthy Food', emoji: '🥗' },
  { id: 'gratitude', name: 'Gratitude', emoji: '🙏' },
  { id: 'pet', name: 'Pet Time', emoji: '🐶' },
  { id: 'laughter', name: 'Laughter', emoji: '😂' },
  { id: 'good_sleep', name: 'Good Sleep', emoji: '😴' },
  { id: 'volunteering', name: 'Volunteering', emoji: '🤝' },
  { id: 'breaks', name: 'Breaks/Rest', emoji: '🛌' },
  { id: 'digital_detox', name: 'Digital Detox', emoji: '📵' },
  { id: 'learning', name: 'Learning/New Skills', emoji: '🧑‍💻' },
  { id: 'travel', name: 'Travel/Change of Scenery', emoji: '✈️' },
];

export const DRAINERS: Activity[] = [
  { id: 'work_stress', name: 'Work Stress', emoji: '💼' },
  { id: 'poor_sleep', name: 'Poor Sleep', emoji: '😴' },
  { id: 'conflict', name: 'Conflict', emoji: '⚡' },
  { id: 'overthinking', name: 'Overthinking', emoji: '💭' },
  { id: 'junk_food', name: 'Junk Food', emoji: '🍔' },
  { id: 'isolation', name: 'Isolation', emoji: '🙈' },
  { id: 'screen_time', name: 'Too Much Screen', emoji: '📱' },
  { id: 'financial', name: 'Financial Worry', emoji: '💸' },
  { id: 'illness', name: 'Illness', emoji: '🤒' },
  { id: 'negative_news', name: 'Negative News', emoji: '📰' },
  { id: 'commute', name: 'Commute', emoji: '🚗' },
  { id: 'weather', name: 'Bad Weather', emoji: '🌧️' },
  { id: 'noise', name: 'Noise', emoji: '🔊' },
  { id: 'procrastination', name: 'Procrastination', emoji: '⏳' },
  { id: 'study_overload', name: 'Study Overload', emoji: '📚' },
  { id: 'burnout', name: 'Burnout/Productivity Pressure', emoji: '🔥' },
  { id: 'comparison', name: 'Comparison/Social Media', emoji: '📲' },
  { id: 'lack_recognition', name: 'Lack of Recognition', emoji: '🙄' },
  { id: 'uncertainty', name: 'Uncertainty/Change', emoji: '🔄' },
]; 