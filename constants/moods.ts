// Mood options for the check-in screen
export type Mood = {
  id: string;
  label: string;
  icon: string; // Unicode emoji for now
};

const moods: Mood[] = [
  { id: 'great', label: 'Great', icon: '😄' },
  { id: 'good', label: 'Good', icon: '🙂' },
  { id: 'okay', label: 'Okay', icon: '😐' },
  { id: 'challenged', label: 'Challenged', icon: '😕' },
  { id: 'struggling', label: 'Struggling', icon: '😞' },
];

export default moods;