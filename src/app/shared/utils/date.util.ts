/**
 * Normalizes a date to midnight UTC to avoid timezone shifts when serializing to JSON.
 * This ensures that when a user selects a date (e.g., November 27th), it's sent as
 * "2025-11-27T00:00:00.000Z" instead of potentially "2025-11-26T23:00:00.000Z" due to timezone conversion.
 * 
 * @param date - The date to normalize
 * @returns A new Date object set to midnight UTC of the same calendar date
 */
export function normalizeDateToUTCMidnight(date: Date | null | undefined): Date | null {
  if (!date) {
    return null;
  }

  // Get the year, month, and day from the local date
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Create a new date at midnight UTC for the same calendar date
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

/**
 * Formats a date as an ISO string at midnight UTC.
 * This is useful when you need to send a date-only value to the server
 * without timezone shifts.
 * 
 * @param date - The date to format
 * @returns ISO string in format "YYYY-MM-DDTHH:mm:ss.sssZ" at midnight UTC, or null if date is null/undefined
 */
export function formatDateAsUTCMidnightISO(date: Date | null | undefined): string | null {
  if (!date) {
    return null;
  }

  const normalized = normalizeDateToUTCMidnight(date);
  return normalized ? normalized.toISOString() : null;
}

