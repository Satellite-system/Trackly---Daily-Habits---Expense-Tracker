'use client';

import { useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Habit } from '@/lib/types';
import { Loader } from '../layout/loader';
import { useFirestore, useUser, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

interface DeleteHabitAlertProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteHabitAlert({ habit, open, onOpenChange }: DeleteHabitAlertProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const handleDelete = () => {
    if (!user || !firestore) return;
    startTransition(() => {
      try {
        const habitDoc = doc(firestore, 'users', user.uid, 'habits', habit.id);
        deleteDocumentNonBlocking(habitDoc);
        toast({
          title: 'Habit Deleted',
          description: `"${habit.name}" has been removed.`,
        });
        onOpenChange(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not delete the habit.',
        });
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the habit "{habit.name}" and all its
            progress. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending ? <Loader /> : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
