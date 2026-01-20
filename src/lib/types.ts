import type { Timestamp } from 'firebase/firestore';

export type Habit = {
  id: string;
  name: string;
  description?: string;
  createdAt: Timestamp;
  completions: Timestamp[];
  uid: string;
};
