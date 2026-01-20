'use client';

import { useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Habit } from '@/lib/types';
import { AddEditHabitForm, type HabitFormValues } from './add-edit-habit-form';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

interface EditHabitDialogProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditHabitDialog({ habit, open, onOpenChange }: EditHabitDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const handleSubmit = (values: HabitFormValues) => {
    if (!user || !firestore) return;
    startTransition(() => {
      try {
        const habitDoc = doc(firestore, 'users', user.uid, 'habits', habit.id);
        updateDocumentNonBlocking(habitDoc, {
            name: values.name,
            description: values.description || '',
        });
        toast({
          title: 'Habit Updated!',
          description: `"${values.name}" has been updated.`,
        });
        onOpenChange(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not update the habit.',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Update the details for your habit.
          </DialogDescription>
        </DialogHeader>
        <AddEditHabitForm
          onSubmit={handleSubmit}
          isPending={isPending}
          defaultValues={{ name: habit.name, description: habit.description }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
