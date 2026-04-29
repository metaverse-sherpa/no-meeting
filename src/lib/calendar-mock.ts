export interface DetectedMeeting {
  id: string;
  title: string;
  attendees: number;
  duration_min: number;
  scheduled_at: string; // ISO
  organizer: string;
  dismissed: boolean;
  converted: boolean;
  calendar: 'google' | 'outlook';
}

const STORAGE_KEY = 'crux-detected-meetings';

const SEED: DetectedMeeting[] = [
  {
    id: 'dm-1',
    title: 'Q3 roadmap sign-off',
    attendees: 5,
    duration_min: 60,
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: 'you',
    dismissed: false,
    converted: false,
    calendar: 'google',
  },
  {
    id: 'dm-2',
    title: 'Pricing model decision',
    attendees: 4,
    duration_min: 45,
    scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: 'you',
    dismissed: false,
    converted: false,
    calendar: 'google',
  },
  {
    id: 'dm-3',
    title: 'API design review',
    attendees: 3,
    duration_min: 30,
    scheduled_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: 'you',
    dismissed: false,
    converted: false,
    calendar: 'google',
  },
];

export function getDetectedMeetings(): DetectedMeeting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DetectedMeeting[];
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
  return SEED;
}

export function updateDetectedMeeting(id: string, patch: Partial<DetectedMeeting>) {
  const meetings = getDetectedMeetings();
  const updated = meetings.map((m) => (m.id === id ? { ...m, ...patch } : m));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function resetDetectedMeetings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
}

export function formatScheduled(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `in ${diff} days`;
}
