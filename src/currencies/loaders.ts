import { load } from './data.ts';
import type { ICurrency } from './types.ts';

/** Returns all currencies. */
export async function getCurrencies(): Promise<ICurrency[]> {
  return load();
}

/** Returns a currency by its ISO 4217 code (e.g. "USD"), or undefined if not found. */
export async function getCurrencyByCode(code: string): Promise<ICurrency | undefined> {
  const key = code.toUpperCase();
  return load().find(item => item.code === key);
}

/** Returns all currencies used in a given country (ISO 3166-1 alpha-2 code, e.g. "US"). */
export async function getCurrenciesByCountry(countryCode: string): Promise<ICurrency[]> {
  const key = countryCode.toUpperCase();
  return load().filter(item => item.countries.includes(key));
}

/** Returns true if the given string is a valid ISO 4217 currency code. */
export async function isValidCurrencyCode(code: string): Promise<boolean> {
  return (await getCurrencyByCode(code)) !== undefined;
}

/** Returns currencies whose name or code contains the given query (case-insensitive). */
export async function searchCurrencies(query: string): Promise<ICurrency[]> {
  const key = query.toLowerCase();
  return load().filter(item => item.name.toLowerCase().includes(key)
    || item.namePlural.toLowerCase().includes(key)
    || item.code.toLowerCase().includes(key));
}
