// Mood options for the check-in screen
export type MoodType = 'great' | 'good' | 'okay' | 'challenged' | 'struggling';

export interface Mood {
  id: MoodType;
  label: string;
  icon: string;
  color: string;
}

const moods: Mood[] = [
  {
    id: 'great',
    label: 'Great',
    icon: '😊',
    color: '#98FB98', // Pale Green
  },
  {
    id: 'good',
    label: 'Good',
    icon: '🙂',
    color: '#B0E0E6', // Powder Blue
  },
  {
    id: 'okay',
    label: 'Okay',
    icon: '😐',
    color: '#E6E6FA', // Lavender
  },
  {
    id: 'challenged',
    label: 'Challenged',
    icon: '😕',
    color: '#FFA07A', // Light Salmon
  },
  {
    id: 'struggling',
    label: 'Struggling',
    icon: '😞',
    color: '#D8BFD8', // Thistle
  },
];

export default moods;