import { getTimezoneInfo, getTimezones } from './loaders.ts';
import type { IConvertedTime, ITimezone } from './types.ts';

const local = (date: Date, zone: string): string => date.toLocaleString('en-US', { timeZone: zone });

const offset = (date: Date, zone: string): number => new Date(local(date, zone)).getTimezoneOffset();

const iso = (date: Date, zone: string): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes): string => parts.find(item => item.type === type)?.value ?? '00';
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}`;
};

/**
 * Convert time from one timezone to another
 * @param time - Time to convert (ISO string or Date object)
 * @param fromTimezone - Source timezone (IANA name)
 * @param toTimezone - Target timezone (IANA name)
 * @returns Promise resolving to converted time information
 */
export async function convertTime(
  time: string | Date,
  fromTimezone: string,
  toTimezone: string,
): Promise<IConvertedTime> {
  const date = typeof time === 'string' ? new Date(time) : time;
  const timeDifference = (new Date(local(date, toTimezone)).getTime() - new Date(local(date, fromTimezone)).getTime()) / 3_600_000;
  return {
    originalTime: iso(date, fromTimezone),
    fromTimezone,
    convertedTime: iso(date, toTimezone),
    toTimezone,
    timeDifference,
  };
}

/**
 * Get current time in a specific timezone
 * @param timezoneName - IANA timezone name
 * @returns Promise resolving to current time as ISO string
 */
export async function getCurrentTime(timezoneName: string): Promise<string> {
  const info = await getTimezoneInfo(timezoneName);
  if (!info) throw new Error(`Timezone ${timezoneName} not found`);
  return info.currentTime;
}

/**
 * Check if daylight saving time is currently active in a timezone
 * @param timezoneName - IANA timezone name
 * @param date - Optional date to check (defaults to now)
 * @returns Promise resolving to true if DST is active
 */
export async function isDaylightSaving(
  timezoneName: string,
  date: Date = new Date(),
): Promise<boolean> {
  const year = date.getFullYear();
  const standard = Math.max(offset(new Date(year, 0, 1), timezoneName), offset(new Date(year, 6, 1), timezoneName));
  return offset(date, timezoneName) < standard;
}

/**
 * Get GMT/UTC offset for a timezone in seconds
 * @param timezoneName - IANA timezone name
 * @returns Promise resolving to offset in seconds
 */
export async function getGMTOffset(timezoneName: string): Promise<number> {
  const info = await getTimezoneInfo(timezoneName);
  if (!info) throw new Error(`Timezone ${timezoneName} not found`);
  return info.gmtOffset;
}

/**
 * Format GMT offset from seconds to string (e.g., "UTC-05:00")
 * @param offsetSeconds - Offset in seconds
 * @returns Formatted offset string
 */
export function formatGMTOffset(offsetSeconds: number): string {
  const value = Math.abs(offsetSeconds);
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const sign = offsetSeconds >= 0 ? '+' : '-';
  return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Validate if a timezone name is valid IANA timezone
 * @param timezoneName - Timezone name to validate
 * @returns Promise resolving to true if valid
 */
export async function isValidTimezone(timezoneName: string): Promise<boolean> {
  return (await getTimezones()).some(item => item.zoneName === timezoneName);
}

/**
 * Search timezones by name (partial match)
 * @param searchTerm - Search term
 * @returns Promise resolving to matching timezones
 */
export async function searchTimezones(searchTerm: string): Promise<ITimezone[]> {
  const key = searchTerm.toLowerCase();
  return (await getTimezones()).filter(item => item.zoneName.toLowerCase().includes(key)
    || item.tzName.toLowerCase().includes(key)
    || item.abbreviation.toLowerCase().includes(key));
}

/**
 * Get all unique timezone abbreviations
 * @returns Promise resolving to array of unique abbreviations
 */
export async function getUniqueAbbreviations(): Promise<string[]> {
  return [...new Set((await getTimezones()).map(item => item.abbreviation))].sort();
}

/**
 * Get timezones by GMT offset
 * @param offsetSeconds - GMT offset in seconds
 * @returns Promise resolving to timezones with matching offset
 */
export async function getTimezonesByOffset(offsetSeconds: number): Promise<ITimezone[]> {
  return (await getTimezones()).filter(item => item.gmtOffset === offsetSeconds);
}
