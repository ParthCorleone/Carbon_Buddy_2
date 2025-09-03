import { EmissionEntry } from '@prisma/client';

export function getWeekDateRange(): { gte: Date, lte: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, etc.
    const numDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust so Monday is 0
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - numDay);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { gte: startOfWeek, lte: endOfWeek };
}

export function getSundayWeekRange(): { gte: Date, lt: Date } {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 6 = Saturday

    // Move back to the most recent Sunday
    const start = new Date(today);
    start.setDate(today.getDate() - day);
    start.setHours(0, 0, 0, 0);

    // End = next Sunday (exclusive)
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    end.setHours(0, 0, 0, 0);

    return { gte: start, lt: end };
}

export function calculateStreak(entries: { date: Date }[]): number {
    if (entries.length === 0) {
        return 0;
    }

    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the most recent entry is today or yesterday
    const mostRecentEntryDate = new Date(entries[0].date);
    mostRecentEntryDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - mostRecentEntryDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
        return 0; // Streak is broken if the last entry was before yesterday
    }
    
    streak = 1;

    // Loop through the rest of the entries
    for (let i = 1; i < entries.length; i++) {
        const currentEntryDate = new Date(entries[i-1].date);
        currentEntryDate.setHours(0, 0, 0, 0);
        
        const previousEntryDate = new Date(entries[i].date);
        previousEntryDate.setHours(0, 0, 0, 0);
        
        const dayDifference = (currentEntryDate.getTime() - previousEntryDate.getTime()) / (1000 * 3600 * 24);

        if (dayDifference === 1) {
            streak++;
        } else {
            // As soon as a gap is found, the streak ends
            break; 
        }
    }

    return streak;
}

export function getMonthDateRange(offset: number = 0): { gte: Date, lte: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + offset; // JS months are 0-based

  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999); // last day of month

  return { gte: start, lte: end };
}
