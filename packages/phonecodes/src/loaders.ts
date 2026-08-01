import { load } from './data.ts';
import type { IPhonecode } from './types.ts';

/** Returns all country phone codes sorted by ISO2. */
export async function getPhonecodes(): Promise<IPhonecode[]> {
  return load();
}

/** Returns the phone code entry for a country by ISO2 code (e.g. "IN"), or undefined. */
export async function getPhonecodeByCountry(iso2: string): Promise<IPhonecode | undefined> {
  const key = iso2.toUpperCase();
  return load().find(item => item.iso2 === key);
}

/** Returns all countries that share a given dial code (e.g. "+1" → US, CA, …). */
export async function getCountriesByDialCode(dialCode: string): Promise<IPhonecode[]> {
  const key = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
  return load().filter(item => item.dialCode === key);
}

/** Returns true if the given dial code exists (e.g. "+91"). */
export async function isValidDialCode(dialCode: string): Promise<boolean> {
  return (await getCountriesByDialCode(dialCode)).length > 0;
}

/** Returns entries whose country name or dial code contains the query (case-insensitive). */
export async function searchPhonecodes(query: string): Promise<IPhonecode[]> {
  const key = query.toLowerCase();
  return load().filter(item => item.name.toLowerCase().includes(key)
    || item.iso2.toLowerCase().includes(key)
    || item.dialCode.includes(key)
    || item.phonecode.includes(key));
}
