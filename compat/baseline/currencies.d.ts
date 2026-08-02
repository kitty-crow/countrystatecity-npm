interface ICurrency {
    code: string;
    name: string;
    namePlural: string;
    symbol: string;
    symbolNative: string;
    decimalDigits: number;
    rounding: number;
    countries: string[];
}

/** Returns all currencies. */
declare function getCurrencies(): Promise<ICurrency[]>;
/** Returns a currency by its ISO 4217 code (e.g. "USD"), or undefined if not found. */
declare function getCurrencyByCode(code: string): Promise<ICurrency | undefined>;
/** Returns all currencies used in a given country (ISO 3166-1 alpha-2 code, e.g. "US"). */
declare function getCurrenciesByCountry(countryCode: string): Promise<ICurrency[]>;
/** Returns true if the given string is a valid ISO 4217 currency code. */
declare function isValidCurrencyCode(code: string): Promise<boolean>;
/** Returns currencies whose name or code contains the given query (case-insensitive). */
declare function searchCurrencies(query: string): Promise<ICurrency[]>;

/** Returns the symbol for a currency code (e.g. "USD" → "$"), or undefined if not found. */
declare function getCurrencySymbol(code: string): Promise<string | undefined>;
/** Returns the native symbol for a currency code (e.g. "INR" → "₹"), or undefined if not found. */
declare function getCurrencySymbolNative(code: string): Promise<string | undefined>;
/** Returns a currency by its symbol (e.g. "$"), checking both symbol and symbolNative. */
declare function getCurrencyBySymbol(symbol: string): Promise<ICurrency | undefined>;
/**
 * Formats a number as a currency string using the currency's symbol and decimal rules.
 * e.g. formatCurrencyAmount(1234.5, "USD") → "$1,234.50"
 */
declare function formatCurrencyAmount(amount: number, code: string): Promise<string>;

export { type ICurrency, getCurrencies as default, formatCurrencyAmount, getCurrencies, getCurrenciesByCountry, getCurrencyByCode, getCurrencyBySymbol, getCurrencySymbol, getCurrencySymbolNative, isValidCurrencyCode, searchCurrencies };
