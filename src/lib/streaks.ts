import { differenceInCalendarDays, startOfDay } from 'date-fns';

export function calculateStreak(completions: Date[]): { currentStreak: number, completedToday: boolean } {
  if (completions.length === 0) {
    return { currentStreak: 0, completedToday: false };
  }

  const sortedDates = completions
    .map(d => startOfDay(d))
    .sort((a, b) => b.getTime() - a.getTime());
  
  const uniqueDates = sortedDates.filter((date, index, self) => 
    index === self.findIndex(d => d.getTime() === date.getTime())
  );

  const today = startOfDay(new Date());
  const completedToday = uniqueDates.length > 0 && uniqueDates[0].getTime() === today.getTime();

  let currentStreak = 0;
  let expectedDate = today;

  if (completedToday) {
    currentStreak = 1;
    expectedDate = new Date(today.getTime() - 86400000); // Yesterday
    for (let i = 1; i < uniqueDates.length; i++) {
        if (uniqueDates[i].getTime() === expectedDate.getTime()) {
            currentStreak++;
            expectedDate = new Date(expectedDate.getTime() - 86400000); // Day before
        } else {
            break;
        }
    }
  } else {
    // If not completed today, check if yesterday was completed
    const yesterday = new Date(today.getTime() - 86400000);
    if(uniqueDates.length > 0 && uniqueDates[0].getTime() === yesterday.getTime()) {
        currentStreak = 1;
        expectedDate = new Date(yesterday.getTime() - 86400000);
        for (let i = 1; i < uniqueDates.length; i++) {
            if (uniqueDates[i].getTime() === expectedDate.getTime()) {
                currentStreak++;
                expectedDate = new Date(expectedDate.getTime() - 86400000);
            } else {
                break;
            }
        }
    }
  }

  return { currentStreak, completedToday };
}
