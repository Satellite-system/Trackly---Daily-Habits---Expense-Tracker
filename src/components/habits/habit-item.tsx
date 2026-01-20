'use client';

import { useState, useTransition } from 'react';
import { Flame, Edit, Trash2 } from 'lucide-react';
import { startOfDay } from 'date-fns';

import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { Habit } from '@/lib/types';
import { calculateStreak } from '@/lib/streaks';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { EditHabitDialog } from './edit-habit-dialog';
import { DeleteHabitAlert } from './delete-habit-alert';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';

interface HabitItemProps {
  habit: Habit;
}

export function HabitItem({ habit }: HabitItemProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const today = startOfDay(new Date());
  const isCompletedToday = habit.completions.some(
    c => startOfDay(new Date(c)).getTime() === today.getTime()
  );
  const { currentStreak } = calculateStreak(habit.completions.map(c => new Date(c)));

  const handleToggle = () => {
    if (!user || !firestore) return;
    startTransition(() => {
      try {
        const habitDocRef = doc(firestore, 'users', user.uid, 'habits', habit.id);

        const completionsTimestamps = habit.completions.map(c => Timestamp.fromDate(new Date(c)));

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

        updateDocumentNonBlocking(habitDocRef, {
          completions: completionsTimestamps,
        });

      } catch(error) {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Could not update habit completion."
        })
      }
    });
  };

  return (
    <>
      <Card className={cn(
          "transition-all", 
          isCompletedToday ? 'bg-primary/20 border-primary/50' : 'bg-card'
        )}>
        <CardContent className="p-4 flex items-center gap-4">
          <Checkbox
            id={`habit-${habit.id}`}
            checked={isCompletedToday}
            onCheckedChange={handleToggle}
            disabled={isPending}
            className="h-6 w-6 rounded-full"
          />
          <div className="flex-1">
            <label htmlFor={`habit-${habit.id}`} className="font-semibold text-lg cursor-pointer">
              {habit.name}
            </label>
            {habit.description && (
              <p className="text-sm text-muted-foreground">{habit.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className={cn('h-5 w-5', currentStreak > 0 ? 'text-accent' : '')} />
            <span className={cn('font-bold text-lg', currentStreak > 0 ? 'text-accent-foreground' : '')}>
              {currentStreak}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <EditHabitDialog habit={habit} open={isEditOpen} onOpenChange={setEditOpen} />
      <DeleteHabitAlert habit={habit} open={isDeleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}
