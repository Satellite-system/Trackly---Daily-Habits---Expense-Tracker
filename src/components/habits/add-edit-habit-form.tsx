'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from '@/components/layout/loader';

export const habitSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().optional(),
});

export type HabitFormValues = z.infer<typeof habitSchema>;

interface AddEditHabitFormProps {
  onSubmit: (values: HabitFormValues) => void;
  isPending: boolean;
  defaultValues?: Partial<HabitFormValues>;
  onCancel: () => void;
}

export function AddEditHabitForm({ onSubmit, isPending, defaultValues, onCancel }: AddEditHabitFormProps) {
  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: defaultValues || { name: '', description: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Habit Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Read for 15 minutes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Why is this habit important?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
                Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
                {isPending && <Loader className="mr-2" />}
                Save
            </Button>
        </div>
      </form>
    </Form>
  );
}
