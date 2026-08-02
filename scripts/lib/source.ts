import { readJson } from './fs.ts';

export type TextMap = Record<string, string>;

export interface SrcTimezone {
  readonly zoneName: string;
  readonly gmtOffset: number;
  readonly gmtOffsetName: string;
  readonly abbreviation: string;
  readonly tzName: string;
}

export interface SrcCity {
  readonly id: number;
  readonly name: string;
  readonly latitude: string;
  readonly longitude: string;
  readonly timezone?: string | null;
}

export interface SrcState {
  readonly id: number;
  readonly name: string;
  readonly iso2: string;
  readonly type?: string | null;
  readonly latitude: string | null;
  readonly longitude: string | null;
  readonly native?: string | null;
  readonly timezone?: string | null;
  readonly cities?: readonly SrcCity[];
}

export interface SrcCountry {
  readonly id: number;
  readonly name: string;
  readonly iso2: string;
  readonly iso3: string;
  readonly numeric_code: string;
  readonly phonecode: string;
  readonly capital: string;
  readonly currency: string;
  readonly currency_name: string;
  readonly currency_symbol: string;
  readonly tld: string;
  readonly native: string;
  readonly region: string;
  readonly subregion: string;
  readonly nationality: string;
  readonly latitude: string;
  readonly longitude: string;
  readonly emoji: string;
  readonly emojiU: string;
  readonly states?: readonly SrcState[];
  readonly timezones?: readonly SrcTimezone[];
  readonly translations?: Readonly<Record<string, string>>;
}

type Obj = Record<string, unknown>;

const obj = (value: unknown): value is Obj => typeof value === 'object' && value !== null && !Array.isArray(value);
const str = (value: unknown): value is string => typeof value === 'string';
const num = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const maybeStr = (value: unknown): value is string | null | undefined => value == null || str(value);

const timezone = (value: unknown): value is SrcTimezone => {
  if (!obj(value)) return false;
  return str(value['zoneName'])
    && num(value['gmtOffset'])
    && str(value['gmtOffsetName'])
    && str(value['abbreviation'])
    && str(value['tzName']);
};

const city = (value: unknown): value is SrcCity => {
  if (!obj(value)) return false;
  return num(value['id'])
    && str(value['name'])
    && str(value['latitude'])
    && str(value['longitude'])
    && maybeStr(value['timezone']);
};

const state = (value: unknown): value is SrcState => {
  if (!obj(value)) return false;
  if (!num(value['id']) || !str(value['name']) || !str(value['iso2'])) return false;
  if (!maybeStr(value['type']) || !maybeStr(value['latitude']) || !maybeStr(value['longitude'])) return false;
  if (!maybeStr(value['native']) || !maybeStr(value['timezone'])) return false;
  return value['cities'] === undefined || Array.isArray(value['cities']) && value['cities'].every(city);
};

const textMap = (value: unknown): value is Readonly<Record<string, string>> => {
  if (!obj(value)) return false;
  return Object.values(value).every(str);
};

const country = (value: unknown): value is SrcCountry => {
  if (!obj(value) || !num(value['id'])) return false;
  const fields = [
    'name', 'iso2', 'iso3', 'numeric_code', 'phonecode', 'capital', 'currency',
    'currency_name', 'currency_symbol', 'tld', 'native', 'region', 'subregion',
    'nationality', 'latitude', 'longitude', 'emoji', 'emojiU',
  ] as const;
  if (!fields.every(key => str(value[key]))) return false;
  if (value['states'] !== undefined && (!Array.isArray(value['states']) || !value['states'].every(state))) return false;
  if (value['timezones'] !== undefined && (!Array.isArray(value['timezones']) || !value['timezones'].every(timezone))) return false;
  return value['translations'] === undefined || textMap(value['translations']);
};

export const readSource = (file: string): SrcCountry[] => {
  const value = readJson(file);
  if (!Array.isArray(value) || !value.every(country)) {
    throw new TypeError(`Invalid country database: ${file}`);
  }
  return value;
};
