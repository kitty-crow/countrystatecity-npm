interface IPhonecode {
    iso2: string;
    name: string;
    dialCode: string;
    phonecode: string;
}

/** Returns all country phone codes sorted by ISO2. */
declare function getPhonecodes(): Promise<IPhonecode[]>;
/** Returns the phone code entry for a country by ISO2 code (e.g. "IN"), or undefined. */
declare function getPhonecodeByCountry(iso2: string): Promise<IPhonecode | undefined>;
/** Returns all countries that share a given dial code (e.g. "+1" → US, CA, …). */
declare function getCountriesByDialCode(dialCode: string): Promise<IPhonecode[]>;
/** Returns true if the given dial code exists (e.g. "+91"). */
declare function isValidDialCode(dialCode: string): Promise<boolean>;
/** Returns entries whose country name or dial code contains the query (case-insensitive). */
declare function searchPhonecodes(query: string): Promise<IPhonecode[]>;

/** Returns the dial code string for a country ISO2 (e.g. "IN" → "+91"), or undefined. */
declare function getDialCode(iso2: string): Promise<string | undefined>;
/** Returns the raw phonecode for a country ISO2 (e.g. "IN" → "91"), or undefined. */
declare function getPhonecode(iso2: string): Promise<string | undefined>;
/**
 * Formats a local number with the country dial code.
 * e.g. formatWithDialCode("9876543210", "IN") → "+91 9876543210"
 */
declare function formatWithDialCode(localNumber: string, iso2: string): Promise<string>;

export { type IPhonecode, getPhonecodes as default, formatWithDialCode, getCountriesByDialCode, getDialCode, getPhonecode, getPhonecodeByCountry, getPhonecodes, isValidDialCode, searchPhonecodes };
