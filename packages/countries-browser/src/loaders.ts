/**
 * Data loaders for @countrystatecity/countries-browser
 * Uses fetch API to load JSON from jsDelivr CDN with LRU caching
 */

import { clear, load } from './data.ts';
import type { ICity, ICountry, ICountryMeta, IState } from './types.ts';

/**
 * Clear the cache (forces re-initialization on next use, picking up any config changes)
 */
export function clearCache(): void {
  clear();
}

/**
 * Get lightweight list of all countries
 * @returns Array of countries (basic info only)
 */
export async function getCountries(): Promise<ICountry[]> {
  return load<ICountry[]>('countries.json');
}

/**
 * Get full country metadata including timezones and translations
 * @param countryCode - ISO2 country code (e.g., 'US', 'IN')
 * @returns Full country metadata or null if not found
 */
export async function getCountryByCode(countryCode: string): Promise<ICountryMeta | null> {
  if (!countryCode) return null;
  try {
    return await load<ICountryMeta>(`country/${countryCode.toUpperCase()}.json`);
  } catch {
    return null;
  }
}

/**
 * Get all states/provinces for a specific country
 * @param countryCode - ISO2 country code
 * @returns Array of states or empty array if not found
 */
export async function getStatesOfCountry(countryCode: string): Promise<IState[]> {
  if (!countryCode) return [];
  try {
    return await load<IState[]>(`states/${countryCode.toUpperCase()}.json`);
  } catch {
    return [];
  }
}

/**
 * Get specific state by code
 * @param countryCode - ISO2 country code
 * @param stateCode - State code (e.g., 'CA', 'TX')
 * @returns State object or null if not found
 */
export async function getStateByCode(
  countryCode: string,
  stateCode: string,
): Promise<IState | null> {
  return (await getStatesOfCountry(countryCode)).find(state => state.iso2 === stateCode) ?? null;
}

/**
 * Get all cities in a specific state
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @returns Array of cities or empty array if not found
 */
export async function getCitiesOfState(
  countryCode: string,
  stateCode: string,
): Promise<ICity[]> {
  if (!countryCode || !stateCode) return [];
  try {
    return await load<ICity[]>(`cities/${countryCode.toUpperCase()}-${stateCode.toUpperCase()}.json`);
  } catch {
    return [];
  }
}

/**
 * Get specific city by ID
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @param cityId - City ID
 * @returns City object or null if not found
 */
export async function getCityById(
  countryCode: string,
  stateCode: string,
  cityId: number,
): Promise<ICity | null> {
  return (await getCitiesOfState(countryCode, stateCode)).find(city => city.id === cityId) ?? null;
}

/**
 * Get ALL cities in an entire country
 * WARNING: Loads all state city files
 * @param countryCode - ISO2 country code
 * @returns Array of all cities in country
 */
export async function getAllCitiesOfCountry(countryCode: string): Promise<ICity[]> {
  const states = await getStatesOfCountry(countryCode);
  return (await Promise.all(states.map(state => getCitiesOfState(countryCode, state.iso2)))).flat();
}

/**
 * Get every city globally
 * WARNING: MASSIVE data
 * @returns Array of all cities worldwide
 */
export async function getAllCitiesInWorld(): Promise<ICity[]> {
  const rows: ICity[] = [];
  for (const country of await getCountries()) rows.push(...await getAllCitiesOfCountry(country.iso2));
  return rows;
}
