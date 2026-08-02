# @countrystatecity/currencies

ISO 4217 currency data, country mappings, symbols, validation, search and formatting utilities.

## Install

```sh
npm install @countrystatecity/currencies
```

## Use

```ts
import {
  formatCurrencyAmount,
  getCurrenciesByCountry,
  getCurrencyByCode,
} from '@countrystatecity/currencies';

const pound = await getCurrencyByCode('GBP');
const currencies = await getCurrenciesByCountry('GB');
const value = await formatCurrencyAmount(1234.5, 'GBP');
```

The package also exports symbol lookup, reverse symbol lookup, code validation and currency search.

## Licence

Code is available under the MIT licence.

**ODbL-1.0 © dr5hn**

Data is licensed under the Open Database License (ODbL) v1.0. You are free to share and adapt the data as long as you attribute the source, share adaptations under the same licence, and keep the data open.

Source: https://github.com/dr5hn/countries-states-cities-database
