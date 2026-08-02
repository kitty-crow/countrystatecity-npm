import {
  getCountryTranslations,
  getLocales,
  getTranslation,
  getTranslationOrFallback,
  searchByTranslatedName,
} from '../../../src/translations/index.ts';

console.log(await getTranslation('DE', 'fr'));
console.log(await getLocales());
const entry = await getCountryTranslations('IN');
if (entry) console.log(getTranslationOrFallback(entry, 'xx', 'fr'));
console.log((await searchByTranslatedName('Allemagne', 'fr')).map(item => item.iso2));
