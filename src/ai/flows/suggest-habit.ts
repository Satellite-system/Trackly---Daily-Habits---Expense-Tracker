/**
 * @fileOverview A habit suggestion AI agent.
 *
 * - suggestHabit - A function that suggests a habit to the user.
 * - SuggestHabitInput - The input type for the suggestHabit function.
 * - SuggestHabitOutput - The return type for the suggestHabit function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestHabitInputSchema = z.object({
  userProfile: z
    .string()
    .describe(
      'A short description of the user, their goals, and their current habits.'
    ),
});
export type SuggestHabitInput = z.infer<typeof SuggestHabitInputSchema>;

const SuggestHabitOutputSchema = z.object({
  habitName: z.string().describe('The name of the suggested habit.'),
  habitDescription: z
    .string()
    .describe('A description of the suggested habit and its benefits.'),
  motivation: z
    .string()
    .describe('A short, encouraging message to motivate the user.'),
});
export type SuggestHabitOutput = z.infer<typeof SuggestHabitOutputSchema>;

export async function suggestHabit(input: SuggestHabitInput): Promise<SuggestHabitOutput> {
  return suggestHabitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestHabitPrompt',
  input: {schema: SuggestHabitInputSchema},
  output: {schema: SuggestHabitOutputSchema},
  prompt: `You are a helpful AI assistant that suggests new habits to users based on their profile.

  Consider the user's profile, goals, and current habits to suggest a new habit that would be beneficial for them.
  Provide a name for the habit, a description of the habit and its benefits, and a short, encouraging message to motivate the user.

  User Profile: {{{userProfile}}}`,
});

const suggestHabitFlow = ai.defineFlow(
  {
    name: 'suggestHabitFlow',
    inputSchema: SuggestHabitInputSchema,
    outputSchema: SuggestHabitOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
