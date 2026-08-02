import type { ICountryTranslation } from './types.ts';

/** Returns the translation for the given locale, falling back to a second locale, then to the English name. */
export function getTranslationOrFallback(
  entry: ICountryTranslation,
  locale: string,
  fallbackLocale?: string,
): string {
  const direct = entry.translations[locale];
  if (direct !== undefined) return direct;
  const fallback = fallbackLocale ? entry.translations[fallbackLocale] : undefined;
  return fallback ?? entry.name;
}
