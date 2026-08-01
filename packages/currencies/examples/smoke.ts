import {
  getCurrencies,
  getCurrenciesByCountry,
  getCurrencyByCode,
  getCurrencySymbol,
  isValidCurrencyCode,
  searchCurrencies,
} from '../src/index.ts';

console.log((await getCurrencies()).slice(0, 5));
console.log(await getCurrencyByCode('USD'));
console.log(await getCurrenciesByCountry('IN'));
console.log(await getCurrencySymbol('EUR'));
console.log(await isValidCurrencyCode('GBP'));
console.log((await searchCurrencies('franc')).map(item => `${item.code} - ${item.name}`));
