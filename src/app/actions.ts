'use server';

import { revalidatePath } from 'next/cache';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import type { Habit } from '@/lib/types';
import { suggestHabit, SuggestHabitInput } from '@/ai/flows/suggest-habit';
import { startOfDay } from 'date-fns';

async function verifyAuth() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function addHabitAction(habitData: { name: string; description?: string }) {
  const user = await verifyAuth();
  const habitsCollection = collection(db, 'habits');
  await addDoc(habitsCollection, {
    uid: user.uid,
    name: habitData.name,
    description: habitData.description || '',
    createdAt: serverTimestamp(),
    completions: [],
  });
  revalidatePath('/dashboard');
}

export async function updateHabitAction(habitId: string, habitData: { name: string; description?: string }) {
  await verifyAuth();
  const habitDoc = doc(db, 'habits', habitId);
  await updateDoc(habitDoc, {
    name: habitData.name,
    description: habitData.description || '',
  });
  revalidatePath('/dashboard');
}

export async function deleteHabitAction(habitId: string) {
  await verifyAuth();
  const habitDoc = doc(db, 'habits', habitId);
  await deleteDoc(habitDoc);
  revalidatePath('/dashboard');
}

export async function toggleHabitCompletionAction(habitId: string, habitCompletions: string[]) {
  await verifyAuth();
  const habitDocRef = doc(db, 'habits', habitId);

  const today = startOfDay(new Date());
  const completionsTimestamps = habitCompletions.map(c => Timestamp.fromDate(new Date(c)));

  const todayCompletionIndex = completionsTimestamps.findIndex(
    c => startOfDay(c.toDate()).getTime() === today.getTime()
  );

  if (todayCompletionIndex > -1) {
    // Completed today, so remove it
    completionsTimestamps.splice(todayCompletionIndex, 1);
  } else {
    // Not completed today, so add it
    completionsTimestamps.push(Timestamp.fromDate(today));
  }

  await updateDoc(habitDocRef, {
    completions: completionsTimestamps,
  });

  revalidatePath('/dashboard');
}


export async function getHabitSuggestionAction(userProfile: SuggestHabitInput) {
    await verifyAuth();
    try {
        const suggestion = await suggestHabit(userProfile);
        return { success: true, data: suggestion };
    } catch (error) {
        console.error('AI suggestion failed:', error);
        return { success: false, error: 'Failed to get suggestion from AI.' };
    }
}
