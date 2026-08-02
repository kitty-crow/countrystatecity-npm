/**
 * Dynamic data loaders for @world/countries
 * Uses dynamic import() to enable code-splitting and lazy loading
 * Falls back to fs.readFileSync for CommonJS environments
 */

import { countryDir, json, stateDir } from './data.ts';
import type { ICity, ICountry, ICountryMeta, IState } from './types.ts';

const warn = (err: unknown): void => {
  if (!(err instanceof Error)) return;
  if (!err.message.includes('browser') && !err.message.includes('Node.js environment')) return;
  console.warn(`@countrystatecity/countries: ${err.message}`);
};

/**
 * Get lightweight list of all countries
 * @returns Promise with array of countries (basic info only)
 * @bundle ~5KB - Loads countries.json
 */
export async function getCountries(): Promise<ICountry[]> {
  return json<ICountry[]>('./data/countries.json');
}

/**
 * Get full country metadata including timezones and translations
 * @param countryCode - ISO2 country code (e.g., 'US', 'IN')
 * @returns Promise with full country metadata or null if not found
 * @bundle ~5KB per country - Loads {Country-CODE}/meta.json
 */
export async function getCountryByCode(countryCode: string): Promise<ICountryMeta | null> {
  try {
    const dir = await countryDir(countryCode);
    if (!dir) return null;
    return await json<ICountryMeta>(`./data/${dir}/meta.json`);
  } catch (err) {
    warn(err);
    return null;
  }
}

/**
 * Get all states/provinces for a specific country
 * @param countryCode - ISO2 country code
 * @returns Promise with array of states or empty array if not found
 * @bundle ~10-100KB depending on country - Loads {Country-CODE}/states.json
 */
export async function getStatesOfCountry(countryCode: string): Promise<IState[]> {
  try {
    const dir = await countryDir(countryCode);
    if (!dir) return [];
    return await json<IState[]>(`./data/${dir}/states.json`);
  } catch (err) {
    warn(err);
    return [];
  }
}

/**
 * Get specific state by code
 * @param countryCode - ISO2 country code
 * @param stateCode - State code (e.g., 'CA', 'TX')
 * @returns Promise with state object or null if not found
 * @bundle Same as getStatesOfCountry - filters in memory
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
 * @returns Promise with array of cities or empty array if not found
 * @bundle ~5-200KB depending on state - Loads {Country-CODE}/{State-CODE}/cities.json
 */
export async function getCitiesOfState(
  countryCode: string,
  stateCode: string,
): Promise<ICity[]> {
  try {
    const country = await countryDir(countryCode);
    if (!country) return [];
    const state = await stateDir(countryCode, stateCode);
    if (!state) return [];
    return await json<ICity[]>(`./data/${country}/${state}/cities.json`);
  } catch (err) {
    warn(err);
    return [];
  }
}

/**
 * Get ALL cities in an entire country
 * WARNING: Large data size - loads all state city files for the country
 * @param countryCode - ISO2 country code
 * @returns Promise with array of all cities in country
 * @bundle Large - loads multiple city files
 */
export async function getAllCitiesOfCountry(countryCode: string): Promise<ICity[]> {
  const rows: ICity[] = [];
  for (const state of await getStatesOfCountry(countryCode)) rows.push(...await getCitiesOfState(countryCode, state.iso2));
  return rows;
}

/**
 * Get every city globally
 * WARNING: MASSIVE data (8MB+) - rarely needed, use sparingly
 * @returns Promise with array of all cities worldwide
 * @bundle 8MB+ - loads ALL city files
 */
export async function getAllCitiesInWorld(): Promise<ICity[]> {
  const rows: ICity[] = [];
  for (const country of await getCountries()) rows.push(...await getAllCitiesOfCountry(country.iso2));
  return rows;
}

/**
 * Get specific city by ID
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @param cityId - Database city ID
 * @returns Promise with city object or null if not found
 * @bundle Same as getCitiesOfState - filters in memory
 */
export async function getCityById(
  countryCode: string,
  stateCode: string,
  cityId: number,
): Promise<ICity | null> {
  return (await getCitiesOfState(countryCode, stateCode)).find(city => city.id === cityId) ?? null;
}
