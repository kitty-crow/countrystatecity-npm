import { abbreviations, all, country } from './data.ts';
import type { ITimezone, ITimezoneAbbreviation, ITimezoneInfo } from './types.ts';

const offset = (date: Date, zone: string): number => {
  const text = date.toLocaleString('en-US', { timeZone: zone });
  return new Date(text).getTimezoneOffset();
};

/**
 * Get all available timezones
 * Bundle impact: ~20KB
 * @returns Promise resolving to array of all timezones
 */
export async function getTimezones(): Promise<ITimezone[]> {
  return all();
}

/**
 * Get timezones for a specific country
 * Bundle impact: ~2KB per country
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'IN')
 * @returns Promise resolving to array of timezones for the country
 */
export async function getTimezonesByCountry(countryCode: string): Promise<ITimezone[]> {
  try {
    return await country(countryCode);
  } catch {
    console.error(`Timezones for country ${countryCode} not found`);
    return [];
  }
}

/**
 * Get timezone information including current time
 * @param timezoneName - IANA timezone name (e.g., 'America/New_York')
 * @returns Promise resolving to timezone info or null if not found
 */
export async function getTimezoneInfo(timezoneName: string): Promise<ITimezoneInfo | null> {
  const item = (await getTimezones()).find(tz => tz.zoneName === timezoneName);
  if (!item) return null;
  const now = new Date();
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);
  const standard = Math.max(offset(jan, timezoneName), offset(jul, timezoneName));
  return {
    timezone: item.zoneName,
    currentTime: now.toISOString(),
    utcOffset: item.gmtOffsetName,
    isDST: offset(now, timezoneName) < standard,
    gmtOffset: item.gmtOffset,
  };
}

/**
 * Get all timezone abbreviations
 * Bundle impact: ~5KB
 * @returns Promise resolving to array of timezone abbreviations
 */
export async function getTimezoneAbbreviations(): Promise<ITimezoneAbbreviation[]> {
  return abbreviations();
}

/**
 * Find timezone by abbreviation (e.g., 'EST', 'PST')
 * @param abbreviation - Timezone abbreviation
 * @returns Promise resolving to array of matching timezones
 */
export async function getTimezonesByAbbreviation(abbreviation: string): Promise<ITimezone[]> {
  const key = abbreviation.toLowerCase();
  const match = (await getTimezoneAbbreviations()).find(item => item.abbreviation.toLowerCase() === key);
  if (!match) return [];
  return (await getTimezones()).filter(item => match.timezones.includes(item.zoneName));
}
