'use client';

import { Suspense } from 'react';
import { HabitProgress } from '@/components/habits/habit-progress';
import { HabitList } from '@/components/habits/habit-list';
import { SuggestHabit } from '@/components/ai/suggest-habit';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfDay } from 'date-fns';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { HabitDocument } from '@/lib/types';

function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const habitsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'habits'),
      orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data: habitsData, isLoading } = useCollection<HabitDocument>(habitsQuery);

  if (!user) {
    // This should not happen due to layout protection, but as a safeguard:
    return <DashboardSkeleton />;
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const habits = habitsData ? habitsData.map(h => ({
    ...h,
    // Serialize dates for client components
    createdAt: h.createdAt.toDate().toISOString(),
    completions: h.completions.map(c => c.toDate().toISOString()),
    userId: h.userId,
  })) : [];

  const today = startOfDay(new Date());
  const completedToday = habits.filter(h =>
    h.completions.some(c => startOfDay(new Date(c)).getTime() === today.getTime())
  ).length;

  const date = new Date();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {user.displayName?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">{format(date, "eeee, MMMM do")}</p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid gap-8">
            <HabitProgress completed={completedToday} total={habits.length} />
            <HabitList habits={habits} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <SuggestHabit habits={habits} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid gap-8">
            <Skeleton className="h-[120px] w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-[76px] w-full rounded-lg" />
              <Skeleton className="h-[76px] w-full rounded-lg" />
              <Skeleton className="h-[76px] w-full rounded-lg" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
