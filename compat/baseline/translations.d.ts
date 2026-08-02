interface ICountryTranslation {
    iso2: string;
    name: string;
    translations: Record<string, string>;
}

/** Returns all country translation records. */
declare function getTranslations(): Promise<ICountryTranslation[]>;
/** Returns the translation record for a country by ISO 3166-1 alpha-2 code (e.g. "US"), or undefined if not found. */
declare function getCountryTranslations(iso2: string): Promise<ICountryTranslation | undefined>;
/** Returns the translated name for a country in the given locale, or undefined if not found. */
declare function getTranslation(iso2: string, locale: string): Promise<string | undefined>;
/** Returns all available locale codes (e.g. ["ar", "de", "es", ...]). */
declare function getLocales(): Promise<string[]>;
/** Returns all country translation records whose name in the given locale matches the query (case-insensitive). If no locale is given, searches across all locales and the English name. */
declare function searchByTranslatedName(query: string, locale?: string): Promise<ICountryTranslation[]>;

/** Returns the translation for the given locale, falling back to a second locale, then to the English name. */
declare function getTranslationOrFallback(entry: ICountryTranslation, locale: string, fallbackLocale?: string): string;

export { type ICountryTranslation, getCountryTranslations, getLocales, getTranslation, getTranslationOrFallback, getTranslations, searchByTranslatedName };
