//import { EmissionEntry } from '@prisma/client';

/**
 * Calculates the start and end dates for the current week (assuming Monday is the first day).
 */
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

/**
 * Calculates the user's current streak of consecutive days with entries.
 * @param entries - A list of user's emission entries, sorted by date descending.
 */
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
