'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { addHabitAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { AddEditHabitForm, habitSchema, type HabitFormValues } from './add-edit-habit-form';

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddHabitDialog({ open, onOpenChange }: AddHabitDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const handleSubmit = (values: HabitFormValues) => {
    startTransition(async () => {
      try {
        await addHabitAction(values);
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
