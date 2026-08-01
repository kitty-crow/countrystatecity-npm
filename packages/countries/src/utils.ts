/**
 * Utility functions for @world/countries
 */

import { getCitiesOfState, getCountries, getCountryByCode, getStatesOfCountry } from './loaders.ts';
import type { ICity } from './types.ts';

/**
 * Validate if a country code exists
 * @param countryCode - ISO2 country code to validate
 * @returns True if country exists
 */
export async function isValidCountryCode(countryCode: string): Promise<boolean> {
  return (await getCountries()).some(country => country.iso2 === countryCode);
}

/**
 * Validate if a state code exists within a country
 * @param countryCode - ISO2 country code
 * @param stateCode - State code to validate
 * @returns True if state exists in country
 */
export async function isValidStateCode(countryCode: string, stateCode: string): Promise<boolean> {
  return (await getStatesOfCountry(countryCode)).some(state => state.iso2 === stateCode);
}

/**
 * Search cities by name within a state
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @param searchTerm - Search term (case-insensitive)
 * @returns Array of matching cities
 */
export async function searchCitiesByName(
  countryCode: string,
  stateCode: string,
  searchTerm: string,
): Promise<ICity[]> {
  const key = searchTerm.toLowerCase();
  return (await getCitiesOfState(countryCode, stateCode)).filter(city => city.name.toLowerCase().includes(key));
}

/**
 * Get country name by ISO2 code
 * @param countryCode - ISO2 country code
 * @returns Country name or null if not found
 */
export async function getCountryNameByCode(countryCode: string): Promise<string | null> {
  return (await getCountries()).find(country => country.iso2 === countryCode)?.name ?? null;
}

/**
 * Get state name by country and state codes
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @returns State name or null if not found
 */
export async function getStateNameByCode(
  countryCode: string,
  stateCode: string,
): Promise<string | null> {
  return (await getStatesOfCountry(countryCode)).find(state => state.iso2 === stateCode)?.name ?? null;
}

/**
 * Get timezone for a specific city
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @param cityName - Exact city name
 * @returns Timezone string or null if not found
 */
export async function getTimezoneForCity(
  countryCode: string,
  stateCode: string,
  cityName: string,
): Promise<string | null> {
  return (await getCitiesOfState(countryCode, stateCode)).find(city => city.name === cityName)?.timezone ?? null;
}

/**
 * Get all timezones for a country
 * @param countryCode - ISO2 country code
 * @returns Array of timezone names
 */
export async function getCountryTimezones(countryCode: string): Promise<string[]> {
  const country = await getCountryByCode(countryCode);
  if (!country?.timezones) return [];
  return country.timezones.map(timezone => timezone.zoneName);
}
