/**
 * TypeScript interfaces for @countrystatecity/countries-browser
 * Copied from @countrystatecity/countries for API compatibility
 */
interface ITimezone {
    zoneName: string;
    gmtOffset: number;
    gmtOffsetName: string;
    abbreviation: string;
    tzName: string;
}
interface ITranslations {
    [languageCode: string]: string;
}
interface ICountry {
    id: number;
    name: string;
    iso2: string;
    iso3: string;
    numeric_code: string;
    phonecode: string;
    capital: string;
    currency: string;
    currency_name: string;
    currency_symbol: string;
    tld: string;
    native: string;
    region: string;
    subregion: string;
    nationality: string;
    latitude: string;
    longitude: string;
    emoji: string;
    emojiU: string;
}
interface ICountryMeta extends ICountry {
    timezones: ITimezone[];
    translations: ITranslations;
}
interface IState {
    id: number;
    name: string;
    country_id: number;
    country_code: string;
    fips_code: string | null;
    iso2: string;
    type: string | null;
    latitude: string | null;
    longitude: string | null;
    native: string | null;
    timezone: string | null;
    translations: ITranslations;
}
interface ICity {
    id: number;
    name: string;
    state_id: number;
    state_code: string;
    country_id: number;
    country_code: string;
    latitude: string;
    longitude: string;
    native: string | null;
    timezone: string | null;
    translations: ITranslations;
}
interface ConfigOptions {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
    cacheSize?: number;
}

/**
 * Error classes for @countrystatecity/countries-browser
 */
declare class NetworkError extends Error {
    readonly url: string;
    readonly statusCode?: number;
    /**
     * Creates a NetworkError for failed HTTP requests.
     * @param message - Human-readable error description
     * @param url - The URL that caused the failure
     * @param statusCode - Optional HTTP status code
     */
    constructor(message: string, url: string, statusCode?: number);
}
declare class TimeoutError extends Error {
    readonly timeout: number;
    /**
     * Creates a TimeoutError for requests that exceeded the time limit.
     * @param message - Human-readable error description
     * @param timeout - The timeout duration in milliseconds
     */
    constructor(message: string, timeout: number);
}

/**
 * Configuration management for @countrystatecity/countries-browser
 */

/**
 * Override default configuration options
 * @param options - Partial configuration to merge with defaults
 */
declare function configure(options: ConfigOptions): void;
/**
 * Reset configuration to defaults
 */
declare function resetConfiguration(): void;

/**
 * Data loaders for @countrystatecity/countries-browser
 * Uses fetch API to load JSON from jsDelivr CDN with LRU caching
 */

/**
 * Clear the cache (forces re-initialization on next use, picking up any config changes)
 */
declare function clearCache(): void;
/**
 * Get lightweight list of all countries
 * @returns Array of countries (basic info only)
 */
declare function getCountries(): Promise<ICountry[]>;
/**
 * Get full country metadata including timezones and translations
 * @param countryCode - ISO2 country code (e.g., 'US', 'IN')
 * @returns Full country metadata or null if not found
 */
declare function getCountryByCode(countryCode: string): Promise<ICountryMeta | null>;
/**
 * Get all states/provinces for a specific country
 * @param countryCode - ISO2 country code
 * @returns Array of states or empty array if not found
 */
declare function getStatesOfCountry(countryCode: string): Promise<IState[]>;
/**
 * Get specific state by code
 * @param countryCode - ISO2 country code
 * @param stateCode - State code (e.g., 'CA', 'TX')
 * @returns State object or null if not found
 */
declare function getStateByCode(countryCode: string, stateCode: string): Promise<IState | null>;
/**
 * Get all cities in a specific state
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @returns Array of cities or empty array if not found
 */
declare function getCitiesOfState(countryCode: string, stateCode: string): Promise<ICity[]>;
/**
 * Get specific city by ID
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @param cityId - City ID
 * @returns City object or null if not found
 */
declare function getCityById(countryCode: string, stateCode: string, cityId: number): Promise<ICity | null>;
/**
 * Get ALL cities in an entire country
 * WARNING: Loads all state city files
 * @param countryCode - ISO2 country code
 * @returns Array of all cities in country
 */
declare function getAllCitiesOfCountry(countryCode: string): Promise<ICity[]>;
/**
 * Get every city globally
 * WARNING: MASSIVE data
 * @returns Array of all cities worldwide
 */
declare function getAllCitiesInWorld(): Promise<ICity[]>;

/**
 * Utility functions for @countrystatecity/countries-browser
 */

/**
 * Validate if a country code exists
 * @param countryCode - ISO2 country code to validate
 * @returns True if the country code is valid
 */
declare function isValidCountryCode(countryCode: string): Promise<boolean>;
/**
 * Validate if a state code exists in a country
 * @param countryCode - ISO2 country code
 * @param stateCode - State code to validate
 * @returns True if the state code is valid for the given country
 */
declare function isValidStateCode(countryCode: string, stateCode: string): Promise<boolean>;
/**
 * Search cities by name (partial match, case-insensitive)
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @param searchTerm - Partial city name to search for
 * @returns Array of matching cities
 */
declare function searchCitiesByName(countryCode: string, stateCode: string, searchTerm: string): Promise<ICity[]>;
/**
 * Get country name from ISO2 code
 * @param countryCode - ISO2 country code
 * @returns Country name or null if not found
 */
declare function getCountryNameByCode(countryCode: string): Promise<string | null>;
/**
 * Get state name from codes
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @returns State name or null if not found
 */
declare function getStateNameByCode(countryCode: string, stateCode: string): Promise<string | null>;
/**
 * Get timezone for a specific city
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @param cityName - Exact city name
 * @returns Timezone string or null if not found
 */
declare function getTimezoneForCity(countryCode: string, stateCode: string, cityName: string): Promise<string | null>;
/**
 * Get all timezone names for a country
 * @param countryCode - ISO2 country code
 * @returns Array of timezone zone names or empty array if not found
 */
declare function getCountryTimezones(countryCode: string): Promise<string[]>;

export { type ConfigOptions, type ICity, type ICountry, type ICountryMeta, type IState, type ITimezone, type ITranslations, NetworkError, TimeoutError, clearCache, configure, getAllCitiesInWorld, getAllCitiesOfCountry, getCitiesOfState, getCityById, getCountries, getCountryByCode, getCountryNameByCode, getCountryTimezones, getStateByCode, getStateNameByCode, getStatesOfCountry, getTimezoneForCity, isValidCountryCode, isValidStateCode, resetConfiguration, searchCitiesByName };
