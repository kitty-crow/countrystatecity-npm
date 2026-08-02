export type { IPhonecode } from './types.ts';

export {
  getPhonecodes,
  getPhonecodeByCountry,
  getCountriesByDialCode,
  isValidDialCode,
  searchPhonecodes,
} from './loaders.ts';

export {
  getDialCode,
  getPhonecode,
  formatWithDialCode,
} from './utils.ts';

export { getPhonecodes as default } from './loaders.ts';
