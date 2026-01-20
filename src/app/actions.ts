'use server';

import { suggestHabit, type SuggestHabitInput } from '@/ai/flows/suggest-habit';

export async function getHabitSuggestionAction(userProfile: SuggestHabitInput) {
    try {
        const suggestion = await suggestHabit(userProfile);
        return { success: true, data: suggestion };
    } catch (error) {
        console.error('AI suggestion failed:', error);
        return { success: false, error: 'Failed to get suggestion from AI.' };
    }
}
