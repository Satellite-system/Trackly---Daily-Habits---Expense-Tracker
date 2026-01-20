'use client';

import { useState, useTransition } from 'react';
import { Wand2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getHabitSuggestionAction } from '@/app/actions';
import { Loader } from '@/components/layout/loader';
import type { Habit } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

const FormSchema = z.object({
  userProfile: z.string().min(10, {
    message: 'Please describe yourself in at least 10 characters.',
  }),
});

interface SuggestHabitProps {
  habits: Habit[];
}

export function SuggestHabit({ habits }: SuggestHabitProps) {
  const [isPending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<{ habitName: string; habitDescription: string; motivation: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      userProfile: '',
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    startTransition(async () => {
      setError(null);
      setSuggestion(null);
      const result = await getHabitSuggestionAction(data);
      if (result.success && result.data) {
        setSuggestion(result.data);
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
    });
  };

  const handleAddHabit = () => {
    if (!suggestion || !user || !firestore) return;
    startTransition(() => {
        try {
            const habitsCollection = collection(firestore, 'users', user.uid, 'habits');
            addDocumentNonBlocking(habitsCollection, {
                userId: user.uid,
                name: suggestion.habitName,
                description: suggestion.habitDescription,
                createdAt: serverTimestamp(),
                completions: [],
            });
            toast({
                title: 'Habit Added!',
                description: `"${suggestion.habitName}" has been added to your list.`,
            });
            setSuggestion(null);
            form.reset();
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-accent" />
          <span>Need a new Idea?</span>
        </CardTitle>
        <CardDescription>
          Let our AI suggest a new habit for you based on your goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userProfile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tell us about your goals</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., I want to be more active and read more books."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending && !suggestion} className="w-full">
              {isPending && !suggestion ? <Loader /> : 'Get Suggestion'}
            </Button>
          </form>
        </Form>

        {isPending && !suggestion && (
          <div className="mt-4 flex items-center justify-center">
            <Loader />
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        )}

        {suggestion && (
          <div className="mt-6 rounded-lg border bg-secondary/50 p-4">
            <h4 className="font-bold text-lg">{suggestion.habitName}</h4>
            <p className="text-sm text-muted-foreground mt-1">{suggestion.habitDescription}</p>
            <p className="text-sm font-semibold italic mt-3">"{suggestion.motivation}"</p>
            <Button onClick={handleAddHabit} disabled={isPending} className="mt-4 w-full" variant="outline">
              {isPending ? <Loader /> : 'Add this habit'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
