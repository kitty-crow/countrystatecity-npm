/**
 * Represents a timezone with all its metadata
 */
interface ITimezone {
    /** IANA timezone name (e.g., "America/New_York") */
    zoneName: string;
    /** Country code (ISO 3166-1 alpha-2) */
    countryCode: string;
    /** Timezone abbreviation (e.g., "EST", "PST") */
    abbreviation: string;
    /** GMT offset in seconds */
    gmtOffset: number;
    /** GMT offset formatted (e.g., "UTC-05:00") */
    gmtOffsetName: string;
    /** Full timezone name */
    tzName: string;
}
/**
 * Detailed timezone information including current time
 */
interface ITimezoneInfo {
    /** IANA timezone name */
    timezone: string;
    /** Current time in this timezone (ISO string) */
    currentTime: string;
    /** UTC offset formatted */
    utcOffset: string;
    /** Whether daylight saving time is currently active */
    isDST: boolean;
    /** GMT offset in seconds */
    gmtOffset: number;
}
/**
 * Timezone abbreviation mapping
 */
interface ITimezoneAbbreviation {
    /** Abbreviation (e.g., "EST") */
    abbreviation: string;
    /** Full name (e.g., "Eastern Standard Time") */
    name: string;
    /** Associated IANA timezone names */
    timezones: string[];
}
/**
 * Time conversion result
 */
interface IConvertedTime {
    /** Original time in source timezone */
    originalTime: string;
    /** Source timezone */
    fromTimezone: string;
    /** Converted time in target timezone */
    convertedTime: string;
    /** Target timezone */
    toTimezone: string;
    /** Time difference in hours */
    timeDifference: number;
}

/**
 * Get all available timezones
 * Bundle impact: ~20KB
 * @returns Promise resolving to array of all timezones
 */
declare function getTimezones(): Promise<ITimezone[]>;
/**
 * Get timezones for a specific country
 * Bundle impact: ~2KB per country
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'IN')
 * @returns Promise resolving to array of timezones for the country
 */
declare function getTimezonesByCountry(countryCode: string): Promise<ITimezone[]>;
/**
 * Get timezone information including current time
 * @param timezoneName - IANA timezone name (e.g., 'America/New_York')
 * @returns Promise resolving to timezone info or null if not found
 */
declare function getTimezoneInfo(timezoneName: string): Promise<ITimezoneInfo | null>;
/**
 * Get all timezone abbreviations
 * Bundle impact: ~5KB
 * @returns Promise resolving to array of timezone abbreviations
 */
declare function getTimezoneAbbreviations(): Promise<ITimezoneAbbreviation[]>;
/**
 * Find timezone by abbreviation (e.g., 'EST', 'PST')
 * @param abbreviation - Timezone abbreviation
 * @returns Promise resolving to array of matching timezones
 */
declare function getTimezonesByAbbreviation(abbreviation: string): Promise<ITimezone[]>;

/**
 * Convert time from one timezone to another
 * @param time - Time to convert (ISO string or Date object)
 * @param fromTimezone - Source timezone (IANA name)
 * @param toTimezone - Target timezone (IANA name)
 * @returns Promise resolving to converted time information
 */
declare function convertTime(time: string | Date, fromTimezone: string, toTimezone: string): Promise<IConvertedTime>;
/**
 * Get current time in a specific timezone
 * @param timezoneName - IANA timezone name
 * @returns Promise resolving to current time as ISO string
 */
declare function getCurrentTime(timezoneName: string): Promise<string>;
/**
 * Check if daylight saving time is currently active in a timezone
 * @param timezoneName - IANA timezone name
 * @param date - Optional date to check (defaults to now)
 * @returns Promise resolving to true if DST is active
 */
declare function isDaylightSaving(timezoneName: string, date?: Date): Promise<boolean>;
/**
 * Get GMT/UTC offset for a timezone in seconds
 * @param timezoneName - IANA timezone name
 * @returns Promise resolving to offset in seconds
 */
declare function getGMTOffset(timezoneName: string): Promise<number>;
/**
 * Format GMT offset from seconds to string (e.g., "UTC-05:00")
 * @param offsetSeconds - Offset in seconds
 * @returns Formatted offset string
 */
declare function formatGMTOffset(offsetSeconds: number): string;
/**
 * Validate if a timezone name is valid IANA timezone
 * @param timezoneName - Timezone name to validate
 * @returns Promise resolving to true if valid
 */
declare function isValidTimezone(timezoneName: string): Promise<boolean>;
/**
 * Search timezones by name (partial match)
 * @param searchTerm - Search term
 * @returns Promise resolving to matching timezones
 */
declare function searchTimezones(searchTerm: string): Promise<ITimezone[]>;
/**
 * Get all unique timezone abbreviations
 * @returns Promise resolving to array of unique abbreviations
 */
declare function getUniqueAbbreviations(): Promise<string[]>;
/**
 * Get timezones by GMT offset
 * @param offsetSeconds - GMT offset in seconds
 * @returns Promise resolving to timezones with matching offset
 */
declare function getTimezonesByOffset(offsetSeconds: number): Promise<ITimezone[]>;

export { type IConvertedTime, type ITimezone, type ITimezoneAbbreviation, type ITimezoneInfo, convertTime, getTimezones as default, formatGMTOffset, getCurrentTime, getGMTOffset, getTimezoneAbbreviations, getTimezoneInfo, getTimezones, getTimezonesByAbbreviation, getTimezonesByCountry, getTimezonesByOffset, getUniqueAbbreviations, isDaylightSaving, isValidTimezone, searchTimezones };
