'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import type { Habit } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HabitItem } from './habit-item';
import { AddHabitDialog } from './add-habit-dialog';

interface HabitListProps {
  habits: Habit[];
}

export function HabitList({ habits }: HabitListProps) {
  const [isAddOpen, setAddOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Habits</CardTitle>
            <CardDescription>
              Mark your habits as completed for today.
            </CardDescription>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Habit
          </Button>
        </CardHeader>
        <CardContent>
          {habits.length > 0 ? (
            <div className="space-y-4">
              {habits.map((habit) => (
                <HabitItem key={habit.id} habit={habit} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-12 text-center">
              <h3 className="text-xl font-semibold tracking-tight">
                No habits yet
              </h3>
              <p className="mt-2 text-muted-foreground">
                Add your first habit to start tracking your progress.
              </p>
              <Button className="mt-6" onClick={() => setAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Habit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <AddHabitDialog open={isAddOpen} onOpenChange={setAddOpen} />
    </>
  );
}
