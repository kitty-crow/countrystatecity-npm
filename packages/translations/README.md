# @countrystatecity/translations

Country-name translations with locale discovery, lookup, fallback and search helpers.

## Install

```sh
npm install @countrystatecity/translations
```

## Use

```ts
import {
  getLocales,
  getTranslation,
  searchByTranslatedName,
} from '@countrystatecity/translations';

const locales = await getLocales();
const spanish = await getTranslation('GB', 'es');
const matches = await searchByTranslatedName('Reino', 'es');
```

The package also exports complete translation records and a deterministic locale fallback helper.

## Licence

Code is available under the MIT licence.

**ODbL-1.0 © dr5hn**

Data is licensed under the Open Database License (ODbL) v1.0. You are free to share and adapt the data as long as you attribute the source, share adaptations under the same licence, and keep the data open.

Source: https://github.com/dr5hn/countries-states-cities-database
