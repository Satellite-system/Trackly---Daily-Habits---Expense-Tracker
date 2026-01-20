'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface HabitProgressProps {
  completed: number;
  total: number;
}

export function HabitProgress({ completed, total }: HabitProgressProps) {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Progress</CardTitle>
        <CardDescription>You're doing great, keep it up!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground">{completed} of {total} completed</p>
            <p className="font-semibold">{Math.round(progress)}%</p>
        </div>
        <Progress value={progress} />
      </CardContent>
    </Card>
  );
}
