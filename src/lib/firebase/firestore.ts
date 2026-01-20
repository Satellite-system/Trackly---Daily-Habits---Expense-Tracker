import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import type { Habit } from '../types';

export async function getHabits(uid: string): Promise<Habit[]> {
  const habitsCollection = collection(db, 'habits');
  const q = query(
    habitsCollection,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Habit[];
}
