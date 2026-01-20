import type { Timestamp } from 'firebase/firestore';

// This is the shape of the data in Firestore
export type HabitDocument = {
  name: string;
  description?: string;
  createdAt: Timestamp;
  completions: Timestamp[];
  userId: string;
};

// This is the shape of the data used in the app (client-side)
export type Habit = {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // Serialized timestamp
  completions: string[]; // Serialized timestamps
  userId: string;
};
