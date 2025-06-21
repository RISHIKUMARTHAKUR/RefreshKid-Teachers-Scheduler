import type { Teacher, AvailabilitySlot } from "@/app/interfaces";

export const timezones = {
  IST: 'Asia/Kolkata',
  CST: 'America/Chicago',
  EST: 'America/New_York',
  PST: 'America/Los_Angeles',
  MT: 'America/Denver',
} as const;

export type Timezone = keyof typeof timezones;

export const timezoneLabels: Record<Timezone, string> = {
  IST: 'Indian Standard Time (IST)',
  CST: 'Central Time (CT)',
  EST: 'Eastern Time (ET)',
  PST: 'Pacific Time (PT)',
  MT: 'Mountain Time (MT)',
};

export const timezoneKeys = Object.keys(timezones) as Timezone[];

export const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// This function correctly creates a UTC ISO string from a day of the week, a time,
// and a timezone name, properly accounting for Daylight Saving Time.
export function toUTC(dayOfWeek: number, time: string, timezone: Timezone): string {
  // 1. Determine the next date for the given day of the week.
  const targetDate = new Date();
  const currentDay = targetDate.getDay();
  const dayDifference = (dayOfWeek - currentDay + 7) % 7;
  targetDate.setDate(targetDate.getDate() + dayDifference);

  const [hours, minutes] = time.split(':').map(Number);

  // 2. Get the date components.
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const day = targetDate.getDate();

  // 3. Create a date object assuming the user's input time was in UTC.
  const pseudoUtcDate = new Date(Date.UTC(year, month, day, hours, minutes));

  // 4. Use Intl.DateTimeFormat to find the offset between UTC and the target timezone for that specific date.
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezones[timezone],
    hour12: false,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
  
  const parts = formatter.formatToParts(pseudoUtcDate);
  const map = parts.reduce((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = parseInt(part.value, 10);
    }
    return acc;
  }, {} as Record<string, number>);

  const dateInTzAsUtc = new Date(Date.UTC(map.year, map.month - 1, map.day, map.hour % 24, map.minute, map.second));

  // 5. The difference between our pseudo-UTC date and the time in the target zone gives us the offset.
  const offset = pseudoUtcDate.getTime() - dateInTzAsUtc.getTime();

  // 6. Apply the offset to get the correct final UTC date.
  const finalDate = new Date(pseudoUtcDate.getTime() + offset);

  return finalDate.toISOString();
}

export function formatInTimezone(utcString: string, timezone: Timezone): string {
  try {
    const date = new Date(utcString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezones[timezone],
    }).format(date);
  } catch (e) {
    console.error("Error formatting date", utcString, timezone, e);
    return "Invalid Date";
  }
}

export function formatDayInTimezone(utcString: string, timezone: Timezone): string {
  try {
    const date = new Date(utcString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone: timezones[timezone],
    }).format(date);
  } catch (e) {
    console.error("Error formatting day", utcString, timezone, e);
    return "Invalid Date";
  }
}

export function formatTimeInTimezone(utcString: string, timezone: Timezone): string {
  try {
    const date = new Date(utcString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezones[timezone],
    }).format(date);
  } catch (e) {
    console.error("Error formatting time", utcString, timezone, e);
    return "Invalid Date";
  }
}
