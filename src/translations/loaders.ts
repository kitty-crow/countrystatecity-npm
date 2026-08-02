import { find, load } from './data.ts';
import type { ICountryTranslation } from './types.ts';

/** Returns all country translation records. */
export async function getTranslations(): Promise<ICountryTranslation[]> {
  return load();
}

/** Returns the translation record for a country by ISO 3166-1 alpha-2 code (e.g. "US"), or undefined if not found. */
export async function getCountryTranslations(iso2: string): Promise<ICountryTranslation | undefined> {
  return find(iso2);
}

/** Returns the translated name for a country in the given locale, or undefined if not found. */
export async function getTranslation(iso2: string, locale: string): Promise<string | undefined> {
  return find(iso2)?.translations[locale];
}

/** Returns all available locale codes (e.g. ["ar", "de", "es", ...]). */
export async function getLocales(): Promise<string[]> {
  const first = load()[0];
  if (!first) return [];
  return Object.keys(first.translations).sort();
}

/** Returns all country translation records whose name in the given locale matches the query (case-insensitive). If no locale is given, searches across all locales and the English name. */
export async function searchByTranslatedName(query: string, locale?: string): Promise<ICountryTranslation[]> {
  const key = query.toLowerCase();
  return load().filter(item => {
    if (locale) return item.translations[locale]?.toLowerCase().includes(key) ?? false;
    return item.name.toLowerCase().includes(key)
      || Object.values(item.translations).some(name => name.toLowerCase().includes(key));
  });
}
