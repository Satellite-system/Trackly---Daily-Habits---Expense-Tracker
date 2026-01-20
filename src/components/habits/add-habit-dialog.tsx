'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AddEditHabitForm, type HabitFormValues } from './add-edit-habit-form';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddHabitDialog({ open, onOpenChange }: AddHabitDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const handleSubmit = (values: HabitFormValues) => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to add a habit.' });
        return;
    }
    startTransition(() => {
      try {
        const habitsCollection = collection(firestore, 'users', user.uid, 'habits');
        addDocumentNonBlocking(habitsCollection, {
            userId: user.uid,
            name: values.name,
            description: values.description || '',
            createdAt: serverTimestamp(),
            completions: [],
        });

        toast({
          title: 'Habit Added!',
          description: `"${values.name}" is now on your list.`,
        });
        onOpenChange(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not add the habit.',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Habit</DialogTitle>
          <DialogDescription>
            What new habit do you want to build?
          </DialogDescription>
        </DialogHeader>
        <AddEditHabitForm 
          onSubmit={handleSubmit} 
          isPending={isPending} 
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
