import type { ITimezone, ITimezoneAbbreviation } from './types.ts';

type Json<T> = { readonly default: T };

export const all = async (): Promise<ITimezone[]> => {
  const mod = await import('./data/timezones.json') as Json<ITimezone[]>;
  return mod.default;
};

export const country = async (code: string): Promise<ITimezone[]> => {
  const mod = await import(`./data/by-country/${code}.json`) as Json<ITimezone[]>;
  return mod.default;
};

export const abbreviations = async (): Promise<ITimezoneAbbreviation[]> => {
  const mod = await import('./data/abbreviations.json') as Json<ITimezoneAbbreviation[]>;
  return mod.default;
};
